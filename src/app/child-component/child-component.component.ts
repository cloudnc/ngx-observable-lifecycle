import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getLifecycleHooks, ObservableLifecycle } from 'ngx-observable-lifecycle';
import { take, takeUntil } from 'rxjs/operators';

@ObservableLifecycle()
@Component({
  selector: 'app-child-component',
  templateUrl: './child-component.component.html',
  styleUrls: ['./child-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponentComponent {

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
    } = getLifecycleHooks(this);

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
