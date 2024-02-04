# NgxObservableLifecycle

[![npm version](https://badge.fury.io/js/ngx-observable-lifecycle.svg)](https://www.npmjs.com/package/ngx-observable-lifecycle)
[![Build Status](https://github.com/cloudnc/ngx-observable-lifecycle/workflows/CI/badge.svg)](https://github.com/cloudnc/ngx-observable-lifecycle/actions)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)
[![codecov](https://codecov.io/gh/cloudnc/ngx-observable-lifecycle/branch/master/graph/badge.svg)](https://codecov.io/gh/cloudnc/ngx-observable-lifecycle)
[![License](https://img.shields.io/github/license/cloudnc/ngx-observable-lifecycle)](https://raw.githubusercontent.com/cloudnc/ngx-observable-lifecycle/master/LICENSE)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/ngx-observable-lifecycle/peer/@angular/core)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/ngx-observable-lifecycle/peer/rxjs)


## Features

* Easily develop library components that rely on the Angular component/directive lifecycle
* Avoid bugs caused by forgetting to ensure that Angular hook interfaces are implemented
* Multiple different libraries can share the same underlying hook design
* Hooks are explicitly defined - only the hooks you declare an interest in are observed

## Purpose & Limitations

This library fills the need for a simple way for **library developers** to be able to observe the lifecycle of an Angular 
component.

## Example

Let's say we're building a simple library function that automatically unsubscribes from observables that were manually 
subscribed to within a component. We'll implement this as an RxJS operator that can be used as follows:

```ts
// ./src/app/lib-example/lib-example.component.ts#L11-L11

public timer$ = interval(500).pipe(automaticUnsubscribe(this));
````

In order to create this operator, we can do the following:
```ts
// ./src/app/lib-example/lib-example.ts#L1-L8

import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function automaticUnsubscribe<T>(component: any): (source: Observable<T>) => Observable<T> {
  const { ngOnDestroy } = getObservableLifecycle(component);
  return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(ngOnDestroy));
}
``` 

We call the`getObservableLifecycle` function exported by `ngx-observable-lifecycle` and destructure the `onDestroy` 
observable. This observable is used with a `takeUntil` operator from `rxjs` which will automatically unsubscribe from 
the observable that it is piped on.

And that's it! Developers can now simply decorate their component, and use the rxjs operator on any of the places they 
subscribe manually (i.e. calling `.subscribe()` ) to an observable:

```ts
// ./src/app/lib-example/lib-example.component.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { interval } from 'rxjs';
import { automaticUnsubscribe } from './lib-example';

@Component({
  selector: 'app-lib-example',
  templateUrl: './lib-example.component.html',
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

import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildComponent implements OnChanges {
  @Input() input1: number | undefined | null;
  @Input() input2: string | undefined | null;

  constructor() {
    const {
      ngOnChanges,
      ngOnInit,
      ngDoCheck,
      ngAfterContentInit,
      ngAfterContentChecked,
      ngAfterViewInit,
      ngAfterViewChecked,
      ngOnDestroy,
    } =
      // specifying the generics is only needed if you intend to
      // use the `ngOnChanges` observable, this way you'll have
      // typed input values instead of just a `SimpleChange`
      getObservableLifecycle<ChildComponent, 'input1' | 'input2'>(this);

    ngOnInit.subscribe(() => console.count('onInit'));
    ngDoCheck.subscribe(() => console.count('doCheck'));
    ngAfterContentInit.subscribe(() => console.count('afterContentInit'));
    ngAfterContentChecked.subscribe(() => console.count('afterContentChecked'));
    ngAfterViewInit.subscribe(() => console.count('afterViewInit'));
    ngAfterViewChecked.subscribe(() => console.count('afterViewChecked'));
    ngOnDestroy.subscribe(() => console.count('onDestroy'));

    ngOnChanges.subscribe(changes => {
      console.count('onChanges');

      // do note that we have a type safe object here for `changes`
      // with the inputs from our component and their associated values typed accordingly

      changes.input1?.currentValue; // `number | null | undefined`
      changes.input1?.previousValue; // `number | null | undefined`

      changes.input2?.currentValue; // `string | null | undefined`
      changes.input2?.previousValue; // `string | null | undefined`
    });
  }

  // when using the ngOnChanges hook, you have to define the hook in your class even if it's empty
  // See https://stackoverflow.com/a/77930589/2398593 for more info
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnChanges() {}
}

```

Note with in the above example, all observables complete when the component is destroyed.
