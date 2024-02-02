import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

export const hookSubject: unique symbol = Symbol('ngx-observable-lifecycle-hooks');
export const hooksPatched: unique symbol = Symbol('ngx-observable-lifecycle-hooks-decorator');

export type AllHooks = OnChanges &
  OnInit &
  DoCheck &
  AfterContentInit &
  AfterContentChecked &
  AfterViewInit &
  AfterViewChecked &
  OnDestroy;
export type LifecycleHookKey = keyof AllHooks;

type AllHookOptions = Record<LifecycleHookKey, true>;
type DecorateHookOptions = Partial<AllHookOptions>;

export interface TypedSimpleChange<Data> {
  previousValue: Data;
  currentValue: Data;
  firstChange: boolean;
}

/**
 * FIRST POINT:
 * the key is made optional because an ngOnChanges will only give keys of inputs that have changed
 * SECOND POINT:
 * the value is associated with `| null` as if an input value is defined but actually retrieved with
 * an `async` pipe, we'll initially get a `null` value
 *
 * For both point, feel free to check the following stackblitz that demo this
 * https://stackblitz.com/edit/stackblitz-starters-s5uphw?file=src%2Fmain.ts
 */
export type TypedSimpleChanges<Component, Keys extends keyof Component> = {
  [Key in Keys]?: TypedSimpleChange<Component[Key]> | null;
};

// none of the hooks have arguments, EXCEPT ngOnChanges which we need to handle differently
export type DecoratedHooks<Component, Keys extends keyof Component> = Record<
  Exclude<LifecycleHookKey, 'ngOnChanges'>,
  Observable<void>
> & {
  ngOnChanges: Observable<TypedSimpleChanges<Component, Keys>>;
};
export type DecoratedHooksSub<Component, Keys extends keyof Component> = {
  [k in keyof DecoratedHooks<Component, Keys>]: DecoratedHooks<Component, Keys>[k] extends Observable<infer U>
    ? Subject<U>
    : never;
};

type PatchedComponentInstance<Component, Keys extends keyof Component, Hooks extends LifecycleHookKey = any> = Pick<
  AllHooks,
  Hooks
> & {
  [hookSubject]: Pick<DecoratedHooksSub<Component, Keys>, Hooks>;
  constructor: {
    prototype: {
      [hooksPatched]: Pick<DecorateHookOptions, Hooks>;
    };
  };
};

function getSubjectForHook<Component, Keys extends keyof Component>(
  componentInstance: PatchedComponentInstance<Component, Keys>,
  hook: LifecycleHookKey,
): Subject<void> {
  if (!componentInstance[hookSubject]) {
    componentInstance[hookSubject] = {};
  }

  if (!componentInstance[hookSubject][hook]) {
    componentInstance[hookSubject][hook] = new Subject<void>();
  }

  const proto = componentInstance.constructor.prototype;
  if (!proto[hooksPatched]) {
    proto[hooksPatched] = {};
  }

  if (!proto[hooksPatched][hook]) {
    const originalHook = proto[hook];

    proto[hook] = function (...args: any[]) {
      originalHook?.call(this, ...args);

      if (hook === 'ngOnChanges') {
        this[hookSubject]?.[hook]?.next(args[0]);
      } else {
        this[hookSubject]?.[hook]?.next();
      }
    };

    const originalOnDestroy = proto.ngOnDestroy;
    proto.ngOnDestroy = function (this: PatchedComponentInstance<Component, Keys, typeof hook>) {
      originalOnDestroy?.call(this);
      this[hookSubject]?.[hook]?.complete();
      delete this[hookSubject]?.[hook];
    };

    proto[hooksPatched][hook] = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return componentInstance[hookSubject][hook]!;
}

/**
 * Library authors should use this to create their own lifecycle-aware functionality
 */
export function getObservableLifecycle<Component, Inputs extends keyof Component = never>(
  classInstance: Component,
): DecoratedHooks<Component, Inputs> {
  return new Proxy({} as DecoratedHooks<Component, Inputs>, {
    get(target: DecoratedHooks<Component, Inputs>, p: LifecycleHookKey): Observable<void> {
      return getSubjectForHook(classInstance as unknown as PatchedComponentInstance<any, any>, p).asObservable();
    },
  });
}
