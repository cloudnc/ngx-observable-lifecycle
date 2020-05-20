import { decorateObservableLifecycle, getLifecycleHooks } from 'ngx-observable-lifecycle';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function AutomaticUnsubscribe(): ClassDecorator {
  return function (target) {
    decorateObservableLifecycle(target, {
      hooks: {
      onDestroy: true,
    },
      incompatibleComponentError: new Error(
        `You must use @AutomaticUnsubscribe with a directive or component.`,
      ),
  });
  };
}

export function automaticUnsubscribe<T>(component): (source: Observable<T>) => Observable<T> {
  const { onDestroy } = getLifecycleHooks(component, {
    missingDecoratorError: new Error(
      'You must decorate the component or interface with @AutomaticUnsubscribe for automaticUnsubscribe to be able to function!',
    ),
    incompatibleComponentError: new Error(
      `You must use automaticUnsubscribe with a directive or component. This type (${component?.constructor.name}) is not compatible with automaticUnsubscribe!`,
    ),
  });
  return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(onDestroy));
}
