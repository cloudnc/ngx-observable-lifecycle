import {
  ɵComponentDef as ComponentDef,
  ɵComponentType as ComponentType,
  ɵDirectiveDef as DirectiveDef,
  ɵDirectiveType as DirectiveType,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

const NG_COMPONENT_DEF = 'ɵcmp';
const NG_DIRECTIVE_DEF = 'ɵdir';

function getDef<T>(
  type: DirectiveType<T> | ComponentType<T>,
): DirectiveDef<T> | ComponentDef<T> {
  return (
    (type as ComponentType<T>)[NG_COMPONENT_DEF] ||
    (type as DirectiveType<T>)[NG_DIRECTIVE_DEF]
  );
}

const hookProp: unique symbol = Symbol('ngx-observable-lifecycle-hooks');


interface DecorateHookOptions {
  onChanges?: true;
  onInit?: true;
  doCheck?: true;
  afterContentInit?: true;
  afterContentChecked?: true;
  afterViewInit?: true;
  afterViewChecked?: true;
  onDestroy?: true;
}
const allHooks: DecorateHookOptions = {
  onChanges: true,
  onInit: true,
  doCheck: true,
  afterContentInit: true,
  afterContentChecked: true,
  afterViewInit: true,
  afterViewChecked: true,
  onDestroy: true,
}

export type DecoratedHooks<T extends DecorateHookOptions> = {
  [P in keyof T]: T[P] extends true ? Observable<void> : never
}

export function decorateObservableLifecycle(target, options: DecorateHookOptions): void {

  const def = getDef(target);

  if (def[hookProp]) {
    return; // already decorated
  }

  def[hookProp] = Object.keys(options).reduce((hooksMap, hook) => {

    hooksMap[hook] = new Subject();

    const originalHook = def[hook];
    def[hook] = function () {
      originalHook && originalHook.call(this);

      hooksMap[hook].next();
    };

    return hooksMap;
  }, {});

}

export function ObservableLifecycle(options: DecorateHookOptions = allHooks): ClassDecorator {
  return function (target) {
    decorateObservableLifecycle(target, options);
  }
}

export function getLifecycleHooks<T extends DecorateHookOptions = {}>(target): DecoratedHooks<T> {
  const def = getDef(target.constructor);
  return def[hookProp];
}

