import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildComponent {
  @Input() input1: number | undefined | null;
  @Input() input2: string | undefined | null;

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
    } =
      // specifying the generics is only needed if you intend to
      // use the `ngOnChanges` observable, this way you'll have
      // typed input values instead of just a `SimpleChange`
      getObservableLifecycle<ChildComponent, 'input1' | 'input2'>(this);

    ngOnInit.subscribe(() => console.count('onInit'));
    ngDoCheck.subscribe(() => console.count('doCheck'));
    ngAfterContentInit.subscribe(() => console.count('afterContentInit'));
    ngAfterContentChecked.subscribe(() => console.count('afterContentChecked'));
    ngAfterViewInit.subscribe(() => console.count('afterViewInit'));
    ngAfterViewChecked.subscribe(() => console.count('afterViewChecked'));
    ngOnDestroy.subscribe(() => console.count('onDestroy'));

    ngOnChanges.subscribe(changes => {
      console.count('onChanges');

      // do note that we have a type safe object here for `changes`
      // with the inputs from our component and their associated values typed accordingly

      changes.input1?.currentValue; // `number | null | undefined`
      changes.input1?.previousValue; // `number | null | undefined`

      changes.input2?.currentValue; // `string | null | undefined`
      changes.input2?.previousValue; // `string | null | undefined`
    });
  }
}
