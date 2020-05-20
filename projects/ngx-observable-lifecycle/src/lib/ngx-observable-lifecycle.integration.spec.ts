import { CommonModule } from '@angular/common';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { getObservableLifecycle, ObservableLifecycle } from './ngx-observable-lifecycle';
import createSpyObj = jasmine.createSpyObj;

describe('integration', () => {
  type ObserverSpy = {
    next: jasmine.Spy;
    complete: jasmine.Spy;
    error: jasmine.Spy;
  };

  let ngAfterContentCheckedSpy: jasmine.Spy;
  let ngAfterContentInitSpy: jasmine.Spy;
  let ngAfterViewCheckedSpy: jasmine.Spy;
  let ngAfterViewInitSpy: jasmine.Spy;
  let ngDoCheckSpy: jasmine.Spy;
  let ngOnChangesSpy: jasmine.Spy;
  let ngOnDestroySpy: jasmine.Spy;
  let ngOnInitSpy: jasmine.Spy;

  let onChanges$Spy: ObserverSpy;
  let onInit$Spy: ObserverSpy;
  let doCheck$Spy: ObserverSpy;
  let afterContentInit$Spy: ObserverSpy;
  let afterContentChecked$Spy: ObserverSpy;
  let afterViewInit$Spy: ObserverSpy;
  let afterViewChecked$Spy: ObserverSpy;
  let onDestroy$Spy: ObserverSpy;

  // tslint:disable:no-conflicting-lifecycle
  @ObservableLifecycle()
  @Component({
    selector: 'lib-test-component',
    template: 'test-component',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    public ngAfterContentChecked(): void {
      ngAfterContentCheckedSpy();
    }

    public ngAfterContentInit(): void {
      ngAfterContentInitSpy();
    }

    public ngAfterViewChecked(): void {
      ngAfterViewCheckedSpy();
    }

    public ngAfterViewInit(): void {
      ngAfterViewInitSpy();
    }

    public ngDoCheck(): void {
      ngDoCheckSpy();
    }

    public ngOnChanges(): void {
      ngOnChangesSpy();
    }

    public ngOnDestroy(): void {
      ngOnDestroySpy();
    }

    public ngOnInit(): void {
      ngOnInitSpy();
    }

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

      onChanges.subscribe(onChanges$Spy);
      onInit.subscribe(onInit$Spy);
      doCheck.subscribe(doCheck$Spy);
      afterContentInit.subscribe(afterContentInit$Spy);
      afterContentChecked.subscribe(afterContentChecked$Spy);
      afterViewInit.subscribe(afterViewInit$Spy);
      afterViewChecked.subscribe(afterViewChecked$Spy);
      onDestroy.subscribe(onDestroy$Spy);
    }
  }

  @Component({
    selector: 'lib-host-component',
    template: `
      <h1>Host Component</h1>
      <lib-test-component *ngIf="testComponentVisible"></lib-test-component>
    `,
  })
  class HostComponent {
    public testComponentVisible = false;

    public setTestComponentVisible(visible: boolean) {
      this.testComponentVisible = visible;
    }
  }

  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [HostComponent, TestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    ngAfterContentCheckedSpy = jasmine.createSpy('ngAfterContentChecked');
    ngAfterContentInitSpy = jasmine.createSpy('ngAfterContentInit');
    ngAfterViewCheckedSpy = jasmine.createSpy('ngAfterViewChecked');
    ngAfterViewInitSpy = jasmine.createSpy('ngAfterViewInit');
    ngDoCheckSpy = jasmine.createSpy('ngDoCheck');
    ngOnChangesSpy = jasmine.createSpy('ngOnChanges');
    ngOnDestroySpy = jasmine.createSpy('ngOnDestroy');
    ngOnInitSpy = jasmine.createSpy('ngOnInit');

    const observerSpy = (name: string) => createSpyObj(name, ['next', 'error', 'complete']);

    onChanges$Spy = observerSpy('onChanges$Spy');
    onInit$Spy = observerSpy('onInit$Spy');
    doCheck$Spy = observerSpy('doCheck$Spy');
    afterContentInit$Spy = observerSpy('afterContentInit$Spy');
    afterContentChecked$Spy = observerSpy('afterContentChecked$Spy');
    afterViewInit$Spy = observerSpy('afterViewInit$Spy');
    afterViewChecked$Spy = observerSpy('afterViewChecked$Spy');
    onDestroy$Spy = observerSpy('onDestroy$Spy');

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should not have called any of the spies', () => {
    expect(ngAfterContentCheckedSpy).not.toHaveBeenCalled();
    expect(ngAfterContentInitSpy).not.toHaveBeenCalled();
    expect(ngAfterViewCheckedSpy).not.toHaveBeenCalled();
    expect(ngAfterViewInitSpy).not.toHaveBeenCalled();
    expect(ngDoCheckSpy).not.toHaveBeenCalled();
    expect(ngOnChangesSpy).not.toHaveBeenCalled();
    expect(ngOnDestroySpy).not.toHaveBeenCalled();
    expect(ngOnInitSpy).not.toHaveBeenCalled();

    expect(onChanges$Spy.next).not.toHaveBeenCalled();
    expect(onInit$Spy.next).not.toHaveBeenCalled();
    expect(doCheck$Spy.next).not.toHaveBeenCalled();
    expect(afterContentInit$Spy.next).not.toHaveBeenCalled();
    expect(afterContentChecked$Spy.next).not.toHaveBeenCalled();
    expect(afterViewInit$Spy.next).not.toHaveBeenCalled();
    expect(afterViewChecked$Spy.next).not.toHaveBeenCalled();
    expect(onDestroy$Spy.next).not.toHaveBeenCalled();
  });

  it('should observe the init lifecycle', () => {
    expect(onInit$Spy.next).not.toHaveBeenCalled();
    expect(ngOnInitSpy).not.toHaveBeenCalled();
    component.setTestComponentVisible(true);

    fixture.detectChanges();

    expect(ngOnInitSpy).toHaveBeenCalledTimes(1);
    expect(onInit$Spy.next).toHaveBeenCalledTimes(1);
    component.setTestComponentVisible(false);
    fixture.detectChanges();
    expect(ngOnInitSpy).toHaveBeenCalledTimes(1);
    expect(onInit$Spy.next).toHaveBeenCalledTimes(1);
    component.setTestComponentVisible(true);
    fixture.detectChanges();
    expect(ngOnInitSpy).toHaveBeenCalledTimes(2);
    expect(onInit$Spy.next).toHaveBeenCalledTimes(2);
  });
});
