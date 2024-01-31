import { CommonModule } from '@angular/common';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { map } from 'rxjs/operators';

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
  let componentInstanceId = 0;

  /* eslint-disable @angular-eslint/no-conflicting-lifecycle */
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
      AfterContentInit
  {
    @Input() input: any;

    public componentInstanceId = componentInstanceId++;

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

    public ngOnChanges(simpleChanges: SimpleChanges): void {
      ngOnChangesSpy(simpleChanges);
    }

    public ngOnDestroy(): void {
      ngOnDestroySpy();
    }

    public ngOnInit(): void {
      ngOnInitSpy();
    }

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
      } = getObservableLifecycle(this);

      const instanceId = this.componentInstanceId;

      ngOnChanges.pipe(map(value => ({ instanceId, value }))).subscribe(onChanges$Spy);
      ngOnInit.pipe(map(() => ({ instanceId }))).subscribe(onInit$Spy);
      ngDoCheck.pipe(map(() => ({ instanceId }))).subscribe(doCheck$Spy);
      ngAfterContentInit.pipe(map(() => ({ instanceId }))).subscribe(afterContentInit$Spy);
      ngAfterContentChecked.pipe(map(() => ({ instanceId }))).subscribe(afterContentChecked$Spy);
      ngAfterViewInit.pipe(map(() => ({ instanceId }))).subscribe(afterViewInit$Spy);
      ngAfterViewChecked.pipe(map(() => ({ instanceId }))).subscribe(afterViewChecked$Spy);
      ngOnDestroy.pipe(map(() => ({ instanceId }))).subscribe(onDestroy$Spy);
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

  @Component({
    selector: 'lib-host-with-input-component',
    template: `
      <h1>Host with input Component</h1>
      <lib-test-component *ngIf="testComponentVisible" [input]="inputValue"></lib-test-component>
    `,
  })
  class HostWithInputComponent {
    public testComponentVisible = false;

    public inputValue = undefined;

    public setTestComponentVisible(visible: boolean) {
      this.testComponentVisible = visible;
    }

    public setInputValue(value: any) {
      this.inputValue = value;
    }
  }

  let component: HostComponent;
  let componentWithInput: HostWithInputComponent;
  let fixture: ComponentFixture<HostComponent>;
  let fixtureWithInput: ComponentFixture<HostWithInputComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule],
        declarations: [HostComponent, HostWithInputComponent, TestComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    ngAfterContentCheckedSpy = jasmine.createSpy('ngAfterContentChecked');
    ngAfterContentInitSpy = jasmine.createSpy('ngAfterContentInit');
    ngAfterViewCheckedSpy = jasmine.createSpy('ngAfterViewChecked');
    ngAfterViewInitSpy = jasmine.createSpy('ngAfterViewInit');
    ngDoCheckSpy = jasmine.createSpy('ngDoCheck');
    ngOnChangesSpy = jasmine.createSpy('ngOnChanges');
    ngOnDestroySpy = jasmine.createSpy('ngOnDestroy');
    ngOnInitSpy = jasmine.createSpy('ngOnInit');

    const observerSpy = (name: string) => jasmine.createSpyObj(name, ['next', 'error', 'complete']);

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

    fixtureWithInput = TestBed.createComponent(HostWithInputComponent);
    componentWithInput = fixtureWithInput.componentInstance;
    fixtureWithInput.detectChanges();
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

  it('should observe the destroy lifecycle', () => {
    expect(onDestroy$Spy.next).not.toHaveBeenCalled();
    expect(ngOnDestroySpy).not.toHaveBeenCalled();
    component.setTestComponentVisible(true);
    fixture.detectChanges();

    expect(onDestroy$Spy.next).not.toHaveBeenCalled();
    expect(ngOnDestroySpy).not.toHaveBeenCalled();

    component.setTestComponentVisible(false);
    fixture.detectChanges();

    expect(onDestroy$Spy.next).toHaveBeenCalledTimes(1);
    expect(onDestroy$Spy.complete).toHaveBeenCalledTimes(1);
    expect(ngOnDestroySpy).toHaveBeenCalledTimes(1);
  });

  it('should not emit on different instances of the same type being destroyed', () => {
    const newInstance = new TestComponent();
    component.setTestComponentVisible(true);
    fixture.detectChanges();

    expect(onDestroy$Spy.next).not.toHaveBeenCalled();
    expect(ngOnDestroySpy).not.toHaveBeenCalled();

    newInstance.ngOnDestroy();

    expect(onDestroy$Spy.next).toHaveBeenCalledWith({ instanceId: newInstance.componentInstanceId });

    const componentUnderTest = fixture.debugElement.query(By.directive(TestComponent)).componentInstance;

    expect(onDestroy$Spy.next).not.toHaveBeenCalledWith({ instanceId: componentUnderTest.componentInstanceId });
  });

  it('should still receive the SimpleChanges object in the ngOnChanges original hook and provide the SimpleChanges into the stream as well', () => {
    expect(onChanges$Spy.next).not.toHaveBeenCalled();
    expect(ngOnChangesSpy).not.toHaveBeenCalled();
    componentWithInput.setTestComponentVisible(true);
    fixtureWithInput.detectChanges();

    expect(onChanges$Spy.next).toHaveBeenCalledOnceWith({
      instanceId: jasmine.anything(),
      value: {
        input: new SimpleChange(undefined, undefined, true),
      },
    });
    expect(ngOnChangesSpy).toHaveBeenCalledOnceWith({
      input: new SimpleChange(undefined, undefined, true),
    });

    componentWithInput.setInputValue('New value');
    fixtureWithInput.detectChanges();

    expect(onChanges$Spy.next).toHaveBeenCalledTimes(2);
    expect(onChanges$Spy.next).toHaveBeenCalledWith({
      instanceId: jasmine.anything(),
      value: {
        input: new SimpleChange(undefined, 'New value', false),
      },
    });
    expect(ngOnChangesSpy).toHaveBeenCalledTimes(2);
    expect(ngOnChangesSpy).toHaveBeenCalledWith({
      input: new SimpleChange(undefined, 'New value', false),
    });
  });
});
