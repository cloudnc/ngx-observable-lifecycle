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

// none of the hooks have arguments, EXCEPT ngOnChanges which we need to handle differently
export type DecoratedHooks = Record<Exclude<LifecycleHookKey, 'ngOnChanges'>, Observable<void>> & {
  ngOnChanges: Observable<Parameters<OnChanges['ngOnChanges']>[0]>;
};
export type DecoratedHooksSub = {
  [k in keyof DecoratedHooks]: DecoratedHooks[k] extends Observable<infer U> ? Subject<U> : never;
};

type PatchedComponentInstance<K extends LifecycleHookKey> = Pick<AllHooks, K> & {
  [hookSubject]: Pick<DecoratedHooksSub, K>;
  constructor: {
    prototype: {
      [hooksPatched]: Pick<DecorateHookOptions, K>;
    };
  };
};

function getSubjectForHook(componentInstance: PatchedComponentInstance<any>, hook: LifecycleHookKey): Subject<void> {
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
    proto.ngOnDestroy = function (this: PatchedComponentInstance<typeof hook>) {
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
export function getObservableLifecycle(classInstance: any): DecoratedHooks {
  return new Proxy({} as DecoratedHooks, {
    get(target: DecoratedHooks, p: LifecycleHookKey): Observable<void> {
      return getSubjectForHook(classInstance, p).asObservable();
    },
  });
}
