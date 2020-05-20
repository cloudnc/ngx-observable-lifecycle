import { Component, Directive, ɵComponentDef, ɵivyEnabled, ɵɵdefineComponent } from '@angular/core';
import { isObservable } from 'rxjs';
import { NG_COMPONENT_DEF, NG_DIRECTIVE_DEF } from './ivy-api';
import {
  allHooks,
  AngularLifecycleHook,
  DecoratedHooks,
  decorateObservableLifecycle,
  hooksPatched,
  getLifecycleHooks,
  GetLifecycleHooksOptions,
} from './ngx-observable-lifecycle';

const testErrors: GetLifecycleHooksOptions = {
  missingDecoratorError: new Error('missingDecoratorError'),
  incompatibleComponentError: new Error('incompatibleComponentError'),
};

describe('ngx-observable-lifecycle', () => {
  describe('ivy private hooks', () => {
    @Component({
      template: '',
    })
    class TestComponent {}

    @Directive({
      selector: '[libTestDirective]',
    })
    class TestDirective {}

    it('should have ivy enabled', () => {
      expect(ɵivyEnabled).toBe(true);
    });

    describe('component', () => {
      it('should have a component factory defined on the component', () => {
        expect(TestComponent[NG_COMPONENT_DEF]).toBeDefined(`${NG_COMPONENT_DEF} should be defined`);
      });

      it('should have all the hooks that ngx-observable-lifecycle is decorating', () => {
        const hooks = Object.keys(allHooks);

        const def = TestComponent[NG_COMPONENT_DEF];

        hooks.forEach((hook: AngularLifecycleHook) => {
          expect(def[hook]).toBeDefined(`${hook} should be defined`);
        });
      });
    });

    describe('directive', () => {
      it('should have a directive factory defined on the directive', () => {
        expect(TestDirective[NG_DIRECTIVE_DEF]).toBeDefined(`${NG_DIRECTIVE_DEF} should be defined`);
      });

      it('should have all the hooks that ngx-observable-lifecycle is decorating', () => {
        const hooks = Object.keys(allHooks);

        const def = TestDirective[NG_DIRECTIVE_DEF];

        hooks.forEach((hook: AngularLifecycleHook) => {
          expect(def[hook]).toBeDefined(`${hook} should be defined`);
        });
      });
    });
  });

  describe('decorateObservableLifecycle & getLifecycleHooks', () => {
    let hooks: DecoratedHooks<{
      onDestroy: true;
      doCheck: true;
    }>;

    let componentInstance: TestComponent;

    @Component({
      template: '',
    })
    class TestComponent {
      static ɵcmp: ɵComponentDef<TestComponent> = ɵɵdefineComponent({
        vars: 0,
        decls: 0,
        type: TestComponent,
        selectors: [[]],
        template: () => {},
      });

      static ɵfac = () => new TestComponent();
    }

    beforeEach(() => {
      decorateObservableLifecycle(TestComponent, {
        hooks: {
          onDestroy: true,
          doCheck: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      });
      componentInstance = TestComponent.ɵfac();
      hooks = getLifecycleHooks(componentInstance, testErrors);
    });

    it('should throw if applied to a non-component', () => {
      expect(() =>
        decorateObservableLifecycle(class NotAComponent {}, {
          hooks: {
            onDestroy: true,
            doCheck: true,
          },
          incompatibleComponentError: new Error('incompatibleComponentError'),
        }),
      ).toThrowError('incompatibleComponentError');
    });

    it('should register that the decorator has been applied to the component factory', () => {
      expect(TestComponent[NG_COMPONENT_DEF][hooksPatched]).toBeDefined();
    });

    it('should throw when the class is not a component', () => {
      expect(() => getLifecycleHooks(new (class NotAComponent {})(), testErrors)).toThrowError(
        'incompatibleComponentError',
      );
    });

    it('should throw when the class is not decorated', () => {
      @Component({
        template: '',
      })
      class UndecoratedTestComponent {}

      expect(() => getLifecycleHooks(new UndecoratedTestComponent(), testErrors)).toThrowError('missingDecoratorError');
    });

    it('should retrieve the hooks from a decorated class', () => {
      @Component({
        template: '',
      })
      class LocalTestComponent {}
      decorateObservableLifecycle(LocalTestComponent, {
        hooks: {
          afterViewInit: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      });

      const { afterViewInit } = getLifecycleHooks(new LocalTestComponent(), testErrors);

      expect(isObservable(afterViewInit)).toBe(true);
    });

    it('should call the original method and the hook observer', () => {
      const observerSpy = jasmine.createSpy('onDestroy hook observer');

      const sub = hooks.onDestroy.subscribe(observerSpy);
      TestComponent.ɵcmp.onDestroy.call(componentInstance);

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });

    it('should complete hooks when the component is destroyed', () => {
      const observerSpy = jasmine.createSpy('doCheck hook complete observer');

      const sub = hooks.doCheck.subscribe({ complete: observerSpy });
      TestComponent.ɵcmp.doCheck.call(componentInstance);
      TestComponent.ɵcmp.onDestroy.call(componentInstance);

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });

    it('should be able to be observed multiple times without triggering multiple emissions', () => {
      const firstObserver = jasmine.createSpy('doCheck firstObserver');
      const secondObserver = jasmine.createSpy('doCheck secondObserver');

      const sub = hooks.doCheck.subscribe(firstObserver);
      const { doCheck } = getLifecycleHooks(componentInstance, testErrors);

      sub.add(doCheck.subscribe(secondObserver));

      TestComponent.ɵcmp.doCheck.call(componentInstance);

      expect(firstObserver).toHaveBeenCalledTimes(1);
      expect(secondObserver).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });

    it('should be able to be decorated multiple times, without triggering multiple emissions', () => {
      decorateObservableLifecycle(TestComponent, {
        hooks: {
          afterViewInit: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      });

      const doCheckSpy = jasmine.createSpy('doCheckSpy');
      const afterViewInitSpy = jasmine.createSpy('afterViewInitSpy');

      const { afterViewInit } = getLifecycleHooks(componentInstance, testErrors);
      const { doCheck } = hooks;

      const sub = doCheck.subscribe(doCheckSpy);
      sub.add(afterViewInit.subscribe(afterViewInitSpy));
      TestComponent.ɵcmp.doCheck.call(componentInstance);
      TestComponent.ɵcmp.afterViewInit.call(componentInstance);

      expect(doCheckSpy).toHaveBeenCalledTimes(1);
      expect(afterViewInitSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });
  });
});
