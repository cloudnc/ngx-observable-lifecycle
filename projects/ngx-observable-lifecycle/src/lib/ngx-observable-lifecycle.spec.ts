import { Component, OnDestroy, OnInit } from '@angular/core';
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
  });
});
