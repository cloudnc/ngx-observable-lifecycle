import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxObservableLifecycleComponent } from './ngx-observable-lifecycle.component';

describe('NgxObservableLifecycleComponent', () => {
  let component: NgxObservableLifecycleComponent;
  let fixture: ComponentFixture<NgxObservableLifecycleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxObservableLifecycleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxObservableLifecycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
