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
  [P in keyof T]: T[P] extends true ? Observable<void> : never;
};

/**
 * Library authors should use this to create their own decorators
 */
export function decorateObservableLifecycle(target: any, options: DecorateHookOptions): void {
  const linkInfo = getLinkInfo(target);

  console.log(`linkInfo[hookProp] `, linkInfo[hookProp]);

  linkInfo[hookProp] = (Object.keys(options) as Array<keyof Hooks<any>>).reduce((hooksMap, hook) => {
    if (hooksMap[hook]) {
      console.log(`hook exists, returning`, hook);
      return hooksMap;
    }

    const hook$$ = new Subject<void>();

    hooksMap[hook] = hook$$.asObservable();

    const originalHook = linkInfo[hook];
    linkInfo[hook] = function () {
      originalHook?.call(this);

      hook$$.next();
    };

    const originalDestroy = linkInfo.onDestroy;
    linkInfo.onDestroy = function () {
      originalDestroy?.call(this);
      hook$$.complete();
    };

    return hooksMap;
  }, linkInfo[hookProp] ?? ({} as DecoratedHooks<any>));
}

export interface GetLifecycleHooksOptions {
  missingDecoratorError: Error;
}

/**
 * Library authors should use this to create their own lifecycle-aware functionality
 */
export function getLifecycleHooks<T extends DecorateHookOptions = {}>(
  target: any,
  { missingDecoratorError }: GetLifecycleHooksOptions,
): DecoratedHooks<T> {
  const hooks = getLinkInfo(target.constructor)[hookProp];

  if (!hooks) {
    throw missingDecoratorError;
  }

  return hooks;
}

export function getObservableLifecycle<T extends DecorateHookOptions = AllHookOptions>(target: any): DecoratedHooks<T> {
  return getLifecycleHooks(target, {
    missingDecoratorError: new Error(
      'You must decorate the component or interface with @ObservableLifecycle for getObservableLifecycle to be able to function!',
    ),
  });
}

export function ObservableLifecycle(options: DecorateHookOptions = allHooks): ClassDecorator {
  return target => decorateObservableLifecycle(target, options);
}
