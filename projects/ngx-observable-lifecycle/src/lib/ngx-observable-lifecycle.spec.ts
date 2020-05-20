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
import { async, ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { isObservable } from 'rxjs';
import { NG_COMPONENT_DEF, NG_DIRECTIVE_DEF } from './ivy-api';
import { allHooks, AngularLifecycleHook, hookProp, decorateObservableLifecycle } from './ngx-observable-lifecycle';

describe('ngx-observable-lifecycle', () => {
  @Component({
    template: '',
  })
  class TestComponent
    implements
      OnDestroy,
      OnInit,
      DoCheck,
      OnChanges,
      AfterViewInit,
      AfterViewChecked,
      AfterContentChecked,
      AfterContentInit {
    public ngAfterContentChecked(): void {}

    public ngAfterContentInit(): void {}

    public ngAfterViewChecked(): void {}

    public ngAfterViewInit(): void {}

    public ngDoCheck(): void {}

    public ngOnChanges(changes: SimpleChanges): void {}

    public ngOnDestroy(): void {}

    public ngOnInit(): void {}
  }

  @Directive({
    selector: 'testDirective',
  })
  class TestDirective {}

  describe('ivy private hooks', () => {
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

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('decorateObservableLifecycle', () => {
    beforeEach(() => {
      decorateObservableLifecycle(TestComponent, {
        onDestroy: true,
        doCheck: true,
      });
    });

    it('should register a hook store against the component factory', () => {
      expect(TestComponent[NG_COMPONENT_DEF][hookProp]).toBeDefined();
    });

    it('should have created an observable for the onDestroy hook', () => {
      expect(isObservable(TestComponent[NG_COMPONENT_DEF][hookProp].onDestroy)).toBe(true);
    });

    it('should not have created an observable for a hook that was not requested', () => {
      expect(isObservable(TestComponent[NG_COMPONENT_DEF][hookProp].onInit)).toBe(false);
    });

    it('should call the original method and the hook observer', () => {
      const observerSpy = jasmine.createSpy('onDestroy hook observer');

      const hook = TestComponent[NG_COMPONENT_DEF][hookProp].onDestroy;
      const sub = hook.subscribe(observerSpy);
      TestComponent[NG_COMPONENT_DEF].onDestroy();

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });

    it('should complete hooks when the component is destroyed', () => {
      const observerSpy = jasmine.createSpy('doCheck hook observer');

      const hook = TestComponent[NG_COMPONENT_DEF][hookProp].doCheck;
      const sub = hook.subscribe({ complete: observerSpy });
      TestComponent[NG_COMPONENT_DEF].doCheck();

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });

    it('should be able to be decorated twice, without triggering multiple emissions', () => {
      decorateObservableLifecycle(TestComponent, {
        doCheck: true,
      });

      const observerSpy = jasmine.createSpy('doCheck hook observer');

      const hook = TestComponent[NG_COMPONENT_DEF][hookProp].doCheck;
      const sub = hook.subscribe(observerSpy);
      TestComponent[NG_COMPONENT_DEF].doCheck();

      expect(observerSpy).toHaveBeenCalledTimes(1);
      sub.unsubscribe();
    });
  });
});
