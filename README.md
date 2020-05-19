# NgxObservableLifecycle

[![npm version](https://badge.fury.io/js/ngx-observable-lifecycle.svg)](https://www.npmjs.com/package/ngx-observable-lifecycle)
[![Build Status](https://travis-ci.org/cloudnc/ngx-observable-lifecycle.svg?branch=master)](https://travis-ci.org/cloudnc/ngx-observable-lifecycle)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)
[![License](https://img.shields.io/github/license/cloudnc/ngx-observable-lifecycle)](https://raw.githubusercontent.com/cloudnc/ngx-observable-lifecycle/master/LICENSE)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/ngx-observable-lifecycle/peer/@angular/core)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/ngx-observable-lifecycle/peer/rxjs)

[![NPM](https://nodei.co/npm/ngx-observable-lifecycle.png?compact=true)](https://nodei.co/npm/ngx-observable-lifecycle/)

This library is current a work in progress,
but here's the basics of how it will work:

```ts
// ./src/app/child/child.component.ts

import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import {
  getObservableLifecycle,
  ObservableLifecycle,
} from "ngx-observable-lifecycle";
import { take, takeUntil } from "rxjs/operators";

@ObservableLifecycle()
@Component({
  selector: "app-child",
  templateUrl: "./child.component.html",
  styleUrls: ["./child.component.scss"],
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

    onChanges
      .pipe(takeUntil(onDestroy))
      .subscribe(() => console.count("onChanges"));
    onInit.pipe(takeUntil(onDestroy)).subscribe(() => console.count("onInit"));
    doCheck
      .pipe(takeUntil(onDestroy))
      .subscribe(() => console.count("doCheck"));
    afterContentInit
      .pipe(takeUntil(onDestroy))
      .subscribe(() => console.count("afterContentInit"));
    afterContentChecked
      .pipe(takeUntil(onDestroy))
      .subscribe(() => console.count("afterContentChecked"));
    afterViewInit
      .pipe(takeUntil(onDestroy))
      .subscribe(() => console.count("afterViewInit"));
    afterViewChecked
      .pipe(takeUntil(onDestroy))
      .subscribe(() => console.count("afterViewChecked"));
    onDestroy.pipe(take(1)).subscribe(() => console.count("onDestroy"));
  }
}
```
