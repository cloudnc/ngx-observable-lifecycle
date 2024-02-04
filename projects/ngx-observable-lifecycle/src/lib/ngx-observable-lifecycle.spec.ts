import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { isObservable } from 'rxjs';
import { getObservableLifecycle } from './ngx-observable-lifecycle';

describe('ngx-observable-lifecycle', () => {
  describe('getObservableLifecycle', () => {
    let componentInstance: TestComponent;

    @Component({
      template: '',
    })
    class TestComponent {}

    beforeEach(() => {
      componentInstance = new TestComponent();
    });

    it('should retrieve the hooks from a decorated class', () => {
      @Component({
        template: '',
      })
      class LocalTestComponent {}

      const { ngAfterViewInit } = getObservableLifecycle(new LocalTestComponent());

      expect(isObservable(ngAfterViewInit)).toBe(true);
    });

    it('should not throw on instances of the same class that have not observed the lifecycle (yet)', () => {
      class TestClass implements OnDestroy {
        public ngOnDestroy(): void {}
      }

      const { ngOnInit } = getObservableLifecycle(new TestClass());

      const unobservedInstance = new TestClass();

      expect(() => unobservedInstance.ngOnDestroy()).not.toThrowError();
    });

    it('should re-use observer subjects when a hook is observed multiple times', () => {
      const { ngOnInit: firstObservable } = getObservableLifecycle(componentInstance);
      const { ngOnInit: secondObservable } = getObservableLifecycle(componentInstance);

      expect(firstObservable.source).toBe(secondObservable.source);
    });

    it('invokes the original method if present', () => {
      const originalOnDestroySpy = jasmine.createSpy();

      class TestClass implements OnDestroy {
        public ngOnDestroy(): void {
          originalOnDestroySpy();
        }
      }

      const instance = new TestClass();

      const { ngOnDestroy } = getObservableLifecycle(instance);

      expect(originalOnDestroySpy).not.toHaveBeenCalled();

      instance.ngOnDestroy();

      expect(originalOnDestroySpy).toHaveBeenCalled();
    });

    it('does not need the original hook(s) to be defined', () => {
      const onInitSpy = jasmine.createSpy();

      class TestClass {}

      const instance = new TestClass();

      const { ngOnInit } = getObservableLifecycle(instance);

      ngOnInit.subscribe(onInitSpy);

      expect(onInitSpy).not.toHaveBeenCalled();

      (instance as OnInit).ngOnInit();

      expect(onInitSpy).toHaveBeenCalled();

      (instance as OnDestroy).ngOnDestroy();
    });

    it('should not throw if onDestroy was invoked on difference instances', () => {
      const originalOnDestroySpy = jasmine.createSpy();

      class TestClass implements OnDestroy {
        public ngOnDestroy(): void {
          originalOnDestroySpy();
        }
      }

      const instance = new TestClass();
      const instance2 = new TestClass();

      const { ngOnDestroy } = getObservableLifecycle(instance);

      expect(originalOnDestroySpy).not.toHaveBeenCalled();

      instance.ngOnDestroy();
      instance2.ngOnDestroy();

      expect(originalOnDestroySpy).toHaveBeenCalled();
    });

    // see https://stackoverflow.com/a/77930589/2398593
    it(`should throw if ngOnChanges isn't defined in the component if ngOnChanges observable is used`, () => {
      class LocalTestComponent {
        constructor() {
          // all except ngOnChanges
          // even without having the original `ngOnChanges` hook it should be ok
          const {
            ngOnInit,
            ngDoCheck,
            ngAfterContentInit,
            ngAfterContentChecked,
            ngAfterViewInit,
            ngAfterViewChecked,
            ngOnDestroy,
          } = getObservableLifecycle(this);
        }
      }

      expect(() => new LocalTestComponent()).not.toThrowError();

      class LocalTestWithNgOnChangesNoOriginalHookComponent {
        constructor() {
          // without having the original `ngOnChanges` hook it should throw
          const { ngOnChanges } = getObservableLifecycle(this);
        }
      }
      expect(() => new LocalTestWithNgOnChangesNoOriginalHookComponent()).toThrowError(
        `When using the ngOnChanges hook, you have to define the hook in your class even if it's empty. See https://stackoverflow.com/a/77930589/2398593`,
      );

      class LocalTestWithNgOnChangesAndOriginalHookComponent implements OnChanges {
        constructor() {
          // when we have the original `ngOnChanges` hook it should **not** throw
          const { ngOnChanges } = getObservableLifecycle(this);
        }

        public ngOnChanges(): void {}
      }
      expect(() => new LocalTestWithNgOnChangesAndOriginalHookComponent()).not.toThrowError();
    });
  });
});
