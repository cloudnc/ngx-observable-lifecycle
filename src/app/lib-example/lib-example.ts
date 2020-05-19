import { decorateObservableLifecycle, getLifecycleHooks } from 'ngx-observable-lifecycle';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function AutomaticUnsubscribe(): ClassDecorator {
  return function (target) {
    decorateObservableLifecycle(target, {
      onDestroy: true,
    });
  };
}

export function automaticUnsubscribe<T>(component): (source: Observable<T>) => Observable<T> {
  const { onDestroy } = getLifecycleHooks(component, {
    missingDecoratorError: new Error(
      'You must decorate the component or interface with @AutomaticUnsubscribe for automaticUnsubscribe to be able to function!',
    ),
  });
  return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(onDestroy));
}
