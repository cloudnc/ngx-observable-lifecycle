import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LibExampleComponent } from './lib-example.component';

describe('ChildComponentComponent', () => {
  let component: LibExampleComponent;
  let fixture: ComponentFixture<LibExampleComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LibExampleComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LibExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
