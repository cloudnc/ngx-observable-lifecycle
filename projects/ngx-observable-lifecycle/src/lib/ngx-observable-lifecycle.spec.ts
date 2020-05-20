import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  Directive,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ɵivyEnabled,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { isObservable } from 'rxjs';
import { NG_COMPONENT_DEF, NG_DIRECTIVE_DEF } from './ivy-api';
import {
  allHooks,
  AngularLifecycleHook,
  decorateObservableLifecycle,
  getLifecycleHooks, getObservableLifecycle,
  hookProp, ObservableLifecycle,
} from './ngx-observable-lifecycle';
import createSpyObj = jasmine.createSpyObj;

describe('ngx-observable-lifecycle', () => {

  describe('ivy private hooks', () => {

    @Component({
      template: '',
    })
    class TestComponent {
    }

    @Directive({
      selector: 'testDirective',
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

  describe('decorateObservableLifecycle', () => {

    @Component({
      template: '',
    })
    class TestComponent {
    }

    beforeEach(() => {

      decorateObservableLifecycle(TestComponent, {
        hooks: {
          onDestroy: true,
          doCheck: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      });
    });

    it('should throw if applied to a non-component', () => {
      expect(() => decorateObservableLifecycle(class NotAComponent {}, {
        hooks: {
          onDestroy: true,
          doCheck: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      })).toThrowError('incompatibleComponentError')
    })

    it('should register a hook store against the component factory', () => {
      expect(TestComponent[NG_COMPONENT_DEF][hookProp]).toBeDefined();
    });

    it('should have created an observable for the onDestroy hook', () => {
      expect(isObservable(TestComponent[NG_COMPONENT_DEF][hookProp].onDestroy)).toBe(true);
    });

    it('should not have created an observable for a hook that was not requested', () => {
      expect(isObservable(TestComponent[NG_COMPONENT_DEF][hookProp].onInit)).toBe(false);
    });

    xit('should call the original method and the hook observer', () => {
      const observerSpy = jasmine.createSpy('onDestroy hook observer');

      const hook = TestComponent[NG_COMPONENT_DEF][hookProp].onDestroy;
      const sub = hook.subscribe(observerSpy);
      TestComponent[NG_COMPONENT_DEF].onDestroy();

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });

    it('should complete hooks when the component is destroyed', () => {
      const observerSpy = jasmine.createSpy('doCheck hook complete observer');

      const hook = TestComponent[NG_COMPONENT_DEF][hookProp].doCheck;
      const sub = hook.subscribe({ complete: observerSpy });
      TestComponent[NG_COMPONENT_DEF].doCheck();
      TestComponent[NG_COMPONENT_DEF].onDestroy();

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });

    it('should be able to be decorated twice, without triggering multiple emissions', () => {
      decorateObservableLifecycle(TestComponent, {
        hooks: {
          afterViewInit: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      });
      decorateObservableLifecycle(TestComponent, {
        hooks: {
          afterViewInit: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      });

      const observerSpy = jasmine.createSpy('doCheck hook observer');

      const hook = TestComponent[NG_COMPONENT_DEF][hookProp].afterViewInit;
      const sub = hook.subscribe(observerSpy);
      TestComponent[NG_COMPONENT_DEF].afterViewInit();

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();

    });
  });

  describe('getLifecycleHooks', () => {


    it('should throw when the class is not a component', () => {

      expect(() => getLifecycleHooks(new class NotAComponent {}, {
        missingDecoratorError: new Error('missingDecoratorError'),
        incompatibleComponentError: new Error('incompatibleComponentError'),
      })).toThrowError('incompatibleComponentError')
    })

    it('should throw when the class is not decorated', () => {


      @Component({
        template: '',
      })
      class TestComponent {
      }

      expect(() => getLifecycleHooks(new TestComponent, {
        missingDecoratorError: new Error('missingDecoratorError'),
        incompatibleComponentError: new Error('incompatibleComponentError'),
      })).toThrowError('missingDecoratorError')
    })

    it('should retrieve the hooks from a decorated class', () => {

      @Component({
        template: '',
      })
      class TestComponent {
      }
      decorateObservableLifecycle(TestComponent, {
        hooks: {
          afterViewInit: true,
        },
        incompatibleComponentError: new Error('incompatibleComponentError'),
      });

      const {afterViewInit} = getLifecycleHooks(new TestComponent, {
        missingDecoratorError: new Error('missingDecoratorError'),
        incompatibleComponentError: new Error('incompatibleComponentError'),
      })

      expect(isObservable(afterViewInit)).toBe(true);
    })

  })
});
