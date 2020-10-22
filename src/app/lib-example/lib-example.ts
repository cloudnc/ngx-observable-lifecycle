import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function automaticUnsubscribe<T>(component): (source: Observable<T>) => Observable<T> {
  const { ngOnDestroy } = getObservableLifecycle(component);
  return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(ngOnDestroy));
}
