import { TestBed } from '@angular/core/testing';

import { NgxObservableLifecycleService } from './ngx-observable-lifecycle.service';

describe('NgxObservableLifecycleService', () => {
  let service: NgxObservableLifecycleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxObservableLifecycleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
