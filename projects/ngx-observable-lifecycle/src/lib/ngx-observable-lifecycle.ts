import {
  ɵComponentDef as ComponentDef,
  ɵComponentType as ComponentType,
  ɵDirectiveDef as DirectiveDef,
  ɵDirectiveType as DirectiveType,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NG_COMPONENT_DEF, NG_DIRECTIVE_DEF } from './ivy-api';

export const hookProp: unique symbol = Symbol('ngx-observable-lifecycle-hooks');

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type DecoratedDirective<T> = Writeable<DirectiveDef<T> | ComponentDef<T>> &
  Record<typeof hookProp, DecoratedHooks<any>>;

function getLinkInfo<T>(type: DirectiveType<T> | ComponentType<T>): DecoratedDirective<T> {
  return (type as ComponentType<T>)[NG_COMPONENT_DEF] || (type as DirectiveType<T>)[NG_DIRECTIVE_DEF];
}

export type AngularLifecycleHook =
  | 'onChanges'
  | 'onInit'
  | 'doCheck'
  | 'afterContentInit'
  | 'afterContentChecked'
  | 'afterViewInit'
  | 'afterViewChecked'
  | 'onDestroy';

type Hooks<T> = Pick<DecoratedDirective<T>, AngularLifecycleHook>;

type AllHookOptions = Record<keyof Hooks<any>, true>;
type DecorateHookOptions = Partial<AllHookOptions>;

export const allHooks: AllHookOptions = {
  onChanges: true,
  onInit: true,
  doCheck: true,
  afterContentInit: true,
  afterContentChecked: true,
  afterViewInit: true,
  afterViewChecked: true,
  onDestroy: true,
};

export type DecoratedHooks<T extends DecorateHookOptions> = {
  [P in keyof T]: T[P] extends true ? Observable<void> | undefined : never;
};

export interface DecorateObservableOptions {
  hooks: DecorateHookOptions;
  incompatibleComponentError: Error;
}

/**
 * Library authors should use this to create their own decorators
 */
export function decorateObservableLifecycle(
  target: any,
  { hooks, incompatibleComponentError }: DecorateObservableOptions,
): void {
  const linkInfo = getLinkInfo(target);

  if (!linkInfo) {
    throw incompatibleComponentError;
  }

  const completionCallbacks: Array<() => void> = [];

  linkInfo[hookProp] = (Object.keys(hooks) as Array<keyof Hooks<any>>).reduce((hooksMap, hook) => {
    if (hooksMap[hook]) {
      return hooksMap;
    }

    const hook$$ = new Subject<void>();

    hooksMap[hook] = hook$$.asObservable();

    const originalHook = linkInfo[hook];

    linkInfo[hook] = function () {
      hook$$.next();
      originalHook?.call(this);
    };

    completionCallbacks.push(() => {
      hook$$.complete();
      hooksMap[hook] = undefined;
    });

    return hooksMap;
  }, linkInfo[hookProp] ?? ({} as DecoratedHooks<any>));

  if (completionCallbacks.length) {
    const originalOnDestroy = linkInfo.onDestroy;
    linkInfo.onDestroy = function() {

      originalOnDestroy?.call(this);
      completionCallbacks.forEach(fn => fn());
    }
  }

}

export interface GetLifecycleHooksOptions {
  missingDecoratorError: Error;
  incompatibleComponentError: Error;
}

/**
 * Library authors should use this to create their own lifecycle-aware functionality
 */
export function getLifecycleHooks<T extends DecorateHookOptions = {}>(
  target: any,
  { incompatibleComponentError, missingDecoratorError }: GetLifecycleHooksOptions,
): DecoratedHooks<T> {
  const linkInfo = getLinkInfo(target.constructor);
  if (!linkInfo) {
    throw incompatibleComponentError;
  }
  const hooks = linkInfo[hookProp];

  if (!hooks) {
    throw missingDecoratorError;
  }

  return hooks;
}

export function getObservableLifecycle<T extends DecorateHookOptions = AllHookOptions>(target: any): DecoratedHooks<T> {
  return getLifecycleHooks(target, {
    missingDecoratorError: new Error(
      'You must decorate the component or directive with @ObservableLifecycle for getObservableLifecycle to be able to function!',
    ),
    incompatibleComponentError: new Error(
      `You must use getObservableLifecycle with a directive or component. This type (${target?.constructor.name}) is not compatible with getObservableLifecycle!`,
    ),
  });
}

export function ObservableLifecycle(hooks: DecorateHookOptions = allHooks): ClassDecorator {
  return target =>
    decorateObservableLifecycle(target, {
      hooks,
      incompatibleComponentError: new Error(
        `You must decorate a component or directive. This type (${target?.name}) is not compatible with @ObservableLifecycle!`,
      ),
    });
}
