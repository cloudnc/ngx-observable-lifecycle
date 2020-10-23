import { Component, OnDestroy } from '@angular/core';
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
  });
});
