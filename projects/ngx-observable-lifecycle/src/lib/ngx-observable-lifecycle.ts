import {
  ɵComponentDef as ComponentDef,
  ɵComponentType as ComponentType,
  ɵDirectiveDef as DirectiveDef,
  ɵDirectiveType as DirectiveType,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NG_COMPONENT_DEF, NG_DIRECTIVE_DEF } from './ivy-api';

export const hookProp: unique symbol = Symbol('ngx-observable-lifecycle-hooks');
export const hooksPatched: unique symbol = Symbol('ngx-observable-lifecycle-hooks-decorator');

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type IvyDirective<T> = Writeable<DirectiveDef<T> | ComponentDef<T>>;
export type DecoratedDirective<T, U> = IvyDirective<T> & { [hooksPatched]: HooksType<U, boolean> };

function getLinkInfo<T, U>(type: DirectiveType<T> | ComponentType<T>): DecoratedDirective<T, U> {
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

type Hooks<T> = Pick<IvyDirective<T>, AngularLifecycleHook>;

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

export type HooksType<T extends DecorateHookOptions, U> = {
  [P in keyof T]: T[P] extends true ? U : never;
};

export type DecoratedHooks<T> = HooksType<T, Observable<void>>;
export type DecoratedHooksSub<T> = HooksType<T, Subject<void>>;

export interface DecorateObservableOptions {
  hooks: DecorateHookOptions;
  incompatibleComponentError: Error;
}

type DecoratedClassInstance<T> = { [hookProp]: DecoratedHooksSub<T> };

function getSubjectForHook<T>(classInstance: DecoratedClassInstance<T>, hook: keyof T): Subject<void> {
  if (!classInstance[hookProp]) {
    classInstance[hookProp] = {} as DecoratedClassInstance<T>[typeof hookProp];
  }

  const hooks: DecoratedHooksSub<T> = classInstance[hookProp];

  if (!hooks[hook]) {
    (hooks[hook] as Subject<void>) = new Subject<void>();
  }

  return hooks[hook];
}

function closeHook<T>(classInstance: DecoratedClassInstance<T>, hook: keyof T): void {
  classInstance[hookProp][hook]?.complete();
  delete classInstance[hookProp][hook];
}

/**
 * Library authors should use this to create their own decorators
 */
export function decorateObservableLifecycle<T, U>(
  target: T,
  { hooks, incompatibleComponentError }: DecorateObservableOptions,
): void {
  const linkInfo = getLinkInfo<T, U>(target as any);

  if (!linkInfo) {
    throw incompatibleComponentError;
  }

  linkInfo[hooksPatched] = (Object.keys(hooks) as Array<keyof typeof hooks>).reduce((patched, hook) => {
    // @ts-ignore
    if (patched[hook]) {
      return patched;
    }

    const originalHook = linkInfo[hook];

    linkInfo[hook] = function (this: DecoratedClassInstance<any>) {
      originalHook?.call(this);
      getSubjectForHook(this, hook).next();
    };

    const originalOnDestroy = linkInfo.onDestroy;
    linkInfo.onDestroy = function (this: DecoratedClassInstance<any>) {
      originalOnDestroy?.call(this);
      closeHook(this, hook);
    };

    // @ts-ignore
    patched[hook] = true;
    return patched;
  }, linkInfo[hooksPatched] ?? ({} as any));
}

export interface GetLifecycleHooksOptions {
  missingDecoratorError: Error;
  incompatibleComponentError: Error;
}

/**
 * Library authors should use this to create their own lifecycle-aware functionality
 */
export function getLifecycleHooks<T extends DecorateHookOptions = {}>(
  classInstance: any,
  { incompatibleComponentError, missingDecoratorError }: GetLifecycleHooksOptions,
): DecoratedHooks<T> {
  const linkInfo = getLinkInfo(classInstance.constructor);

  if (!linkInfo) {
    throw incompatibleComponentError;
  }

  if (!linkInfo[hooksPatched]) {
    throw missingDecoratorError;
  }

  return new Proxy({} as DecoratedHooks<T>, {
    get(target: DecoratedHooks<T>, p: keyof T): Observable<void> {
      return getSubjectForHook(classInstance, p).asObservable();
    },
  });
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
