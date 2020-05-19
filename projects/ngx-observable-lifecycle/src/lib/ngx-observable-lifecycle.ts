import {
  ɵComponentDef as ComponentDef,
  ɵComponentType as ComponentType,
  ɵDirectiveDef as DirectiveDef,
  ɵDirectiveType as DirectiveType,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

const NG_COMPONENT_DEF = 'ɵcmp';
const NG_DIRECTIVE_DEF = 'ɵdir';

const hookProp: unique symbol = Symbol('ngx-observable-lifecycle-hooks');
type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type DecoratedDirective<T> = (Writeable<DirectiveDef<T> | ComponentDef<T>>) & Record<typeof hookProp, DecoratedHooks<any>>;


function getDef<T>(
  type: DirectiveType<T> | ComponentType<T>,
): DecoratedDirective<T> {
  return (
    (type as ComponentType<T>)[NG_COMPONENT_DEF] ||
    (type as DirectiveType<T>)[NG_DIRECTIVE_DEF]
  );
}

type AngularLifecycleHooks = 'onChanges'
  | 'onInit'
  | 'doCheck'
  | 'afterContentInit'
  | 'afterContentChecked'
  | 'afterViewInit'
  | 'afterViewChecked'
  | 'onDestroy'

type Hooks<T> = Pick<DecoratedDirective<T>, AngularLifecycleHooks>;

type AllHookOptions = Record<keyof Hooks<any>, true>;
type DecorateHookOptions = Partial<AllHookOptions>;

const allHooks: AllHookOptions = {
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
  [P in keyof T]: T[P] extends true ? Observable<void> : never
}

/**
 * Library authors should use this to create their own decorators
 */
export function decorateObservableLifecycle(target: any, options: DecorateHookOptions): void {

  const def = getDef(target);

  def[hookProp] = (Object.keys(options) as Array<keyof Hooks<any>>).reduce((hooksMap, hook) => {

    if (hooksMap[hook]) {
      return hooksMap;
    }

    const sub = new Subject<void>()

    hooksMap[hook] = sub.asObservable();

    const originalHook = def[hook];
    def[hook] = function () {
      originalHook && originalHook.call(this);

      sub.next();
    };

    return hooksMap;
  }, def[hookProp] ?? {} as DecoratedHooks<any>);

}

export interface GetLifecycleHooksOptions {
  missingDecoratorError: Error;
}

/**
 * Library authors should use this to create their own lifecycle-aware functionality
 */
export function getLifecycleHooks<T extends DecorateHookOptions = {}>(target: any, { missingDecoratorError }: GetLifecycleHooksOptions): DecoratedHooks<T> {
  const hooks = getDef(target.constructor)[hookProp];

  if (!hooks) {
    throw missingDecoratorError;
  }

  return hooks;

}

export function getObservableLifecycle<T extends DecorateHookOptions = AllHookOptions>(target: any): DecoratedHooks<T> {
  return getLifecycleHooks(target, {
    missingDecoratorError: new Error('You must decorate the component or interface with @ObservableLifecycle for getObservableLifecycle to be able to function!'),
  });
}

export function ObservableLifecycle(options: DecorateHookOptions = allHooks): ClassDecorator {
  return function (target) {
    decorateObservableLifecycle(target, options);
  };
}
