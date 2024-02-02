import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildComponent {
  @Input() input: number | undefined | null;

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

    ngOnChanges.subscribe(() => console.count('onChanges'));
    ngOnInit.subscribe(() => console.count('onInit'));
    ngDoCheck.subscribe(() => console.count('doCheck'));
    ngAfterContentInit.subscribe(() => console.count('afterContentInit'));
    ngAfterContentChecked.subscribe(() => console.count('afterContentChecked'));
    ngAfterViewInit.subscribe(() => console.count('afterViewInit'));
    ngAfterViewChecked.subscribe(() => console.count('afterViewChecked'));
    ngOnDestroy.subscribe(() => console.count('onDestroy'));
  }
}
