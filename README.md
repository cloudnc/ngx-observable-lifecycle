# NgxObservableLifecycle

[![npm version](https://badge.fury.io/js/ngx-observable-lifecycle.svg)](https://www.npmjs.com/package/ngx-observable-lifecycle)
[![Build Status](https://travis-ci.org/cloudnc/ngx-observable-lifecycle.svg?branch=master)](https://travis-ci.org/cloudnc/ngx-observable-lifecycle)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)
[![License](https://img.shields.io/github/license/cloudnc/ngx-observable-lifecycle)](https://raw.githubusercontent.com/cloudnc/ngx-observable-lifecycle/master/LICENSE)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/ngx-observable-lifecycle/peer/@angular/core)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/ngx-observable-lifecycle/peer/rxjs)

[![NPM](https://nodei.co/npm/ngx-observable-lifecycle.png?compact=true)](https://nodei.co/npm/ngx-observable-lifecycle/)


## Features

* Easily develop library components that rely on the Angular component/directive lifecycle
* Avoid bugs caused by forgetting to ensure that Angular hook interfaces are implemented
* Multiple different libraries can share the same underlying hook design
* Hooks are explicitly defined - only the hooks you declare an interest in are observed

## Purpose & Limitations

This library fills the need for a simple way for **library developers** to be able to observe the lifecycle of an Angular 
component.

Unfortunately this is non-trivial with simple Angular due to how ngcc compiles components, so this library hooks into 
some of the newer private API's of Ivy. As such, the future compatibility of this library is not guaranteed, however it 
is tested with the version of Angular listed above. Hopefully some day Angular will build the tools to either obsolete 
this library entirely, or at least let it hook into stable APIs so breakages are limited to Angular's breaking releases.    


## Example

Let's say we're building a simple library function that automatically unsubscribes from observables that were manually 
subscribed to within a component. We'll implement this as an RxJS operator that can be used as follows:

```ts
// ./src/app/lib-example/lib-example.component.ts#L13-L13

public timer$ = interval(500).pipe(automaticUnsubscribe(this));
````

To build this lib, first we need to create a decorator that the implementing developers can add to their component.

```ts
// ./src/app/lib-example/lib-example.ts#L1-L11

import { decorateObservableLifecycle, getLifecycleHooks } from 'ngx-observable-lifecycle';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function AutomaticUnsubscribe(): ClassDecorator {
  return function (target) {
    decorateObservableLifecycle(target, {
      onDestroy: true,
    });
  };
}
``` 

This decorator calls `decorateObservableLifecycle` which we pass the target (the constructor of the class) and list the 
lifecycle hooks we want to observe (in this case, just `onDestroy`)

Lastly to implement the rxjs operator itself, we do the following:

 ```ts
 // ./src/app/lib-example/lib-example.ts#L13-L20
 
 export function automaticUnsubscribe<T>(component): (source: Observable<T>) => Observable<T> {
   const { onDestroy } = getLifecycleHooks(component, {
     missingDecoratorError: new Error(
       'You must decorate the component or interface with @AutomaticUnsubscribe for automaticUnsubscribe to be able to function!',
     ),
   });
   return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(onDestroy));
 }
 ```

Similar to the decorator above, we call the`getLifecycleHooks` function exported by `ngx-observable-lifecycle` and 
destructure the `onDestroy` observable. This observable is used with a `takeUntil` operator from `rxjs` which will
automatically unsubscribe from the observable that it is piped on.

Lastly we implement the config object which requires us to define an `Error` for the case where the developer might have
forgotten to add the class decorator (The class decorator holds the secret sauce that allows us to hook into the 
Angular Ivy lifecycle)

And that's it! Developers can now simply decorate their component, and use the rxjs operator on any of the places they 
subscribe manually (i.e. calling `.subscribe()` ) to an observable:

```ts
// ./src/app/lib-example/lib-example.component.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { interval } from 'rxjs';
import { automaticUnsubscribe, AutomaticUnsubscribe } from './lib-example';

@AutomaticUnsubscribe()
@Component({
  selector: 'app-lib-example',
  templateUrl: './lib-example.component.html',
  styleUrls: ['./lib-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibExampleComponent {
  public timer$ = interval(500).pipe(automaticUnsubscribe(this));

  constructor() {
    this.timer$.subscribe({
      next: v => console.log(`timer$ value is ${v}`),
      complete: () => console.log(`timer$ was completed!`),
    });
  }
}

```

## Full API

Here's an example component that hooks onto the full set of available hooks.

```ts
// ./src/app/child/child.component.ts

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getObservableLifecycle, ObservableLifecycle } from 'ngx-observable-lifecycle';
import { take, takeUntil } from 'rxjs/operators';
import { AutomaticUnsubscribe } from '../lib-example/lib-example';

@AutomaticUnsubscribe()
@ObservableLifecycle()
@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildComponent {
  @Input() input: number;

  constructor() {
    const {
      onChanges,
      onInit,
      doCheck,
      afterContentInit,
      afterContentChecked,
      afterViewInit,
      afterViewChecked,
      onDestroy,
    } = getObservableLifecycle(this);

    onChanges.pipe(takeUntil(onDestroy)).subscribe(() => console.count('onChanges'));
    onInit.pipe(takeUntil(onDestroy)).subscribe(() => console.count('onInit'));
    doCheck.pipe(takeUntil(onDestroy)).subscribe(() => console.count('doCheck'));
    afterContentInit.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterContentInit'));
    afterContentChecked.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterContentChecked'));
    afterViewInit.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterViewInit'));
    afterViewChecked.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterViewChecked'));
    onDestroy.pipe(take(1)).subscribe(() => console.count('onDestroy'));
  }
}

```
