import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getObservableLifecycle, ObservableLifecycle } from 'ngx-observable-lifecycle';
import { take, takeUntil } from 'rxjs/operators';
import { AutomaticUnsubscribe } from '../lib-example/lib-example';

@AutomaticUnsubscribe()
@ObservableLifecycle()
@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildComponent {
  @Input() input: number;

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

    onChanges.pipe(takeUntil(onDestroy)).subscribe(() => console.count('onChanges'));
    onInit.pipe(takeUntil(onDestroy)).subscribe(() => console.count('onInit'));
    doCheck.pipe(takeUntil(onDestroy)).subscribe(() => console.count('doCheck'));
    afterContentInit.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterContentInit'));
    afterContentChecked.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterContentChecked'));
    afterViewInit.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterViewInit'));
    afterViewChecked.pipe(takeUntil(onDestroy)).subscribe(() => console.count('afterViewChecked'));
    onDestroy.pipe(take(1)).subscribe(() => console.count('onDestroy'));
  }
}
