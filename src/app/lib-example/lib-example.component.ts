import { ChangeDetectionStrategy, Component } from '@angular/core';
import { interval } from 'rxjs';
import { automaticUnsubscribe } from './lib-example';

@Component({
  selector: 'app-lib-example',
  templateUrl: './lib-example.component.html',
  styleUrls: ['./lib-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibExampleComponent {
  public timer$ = interval(500).pipe(automaticUnsubscribe(this));

  constructor() {
    this.timer$.subscribe({
      next: v => console.log(`timer$ value is ${v}`),
      complete: () => console.log(`timer$ was completed!`),
    });
  }
}
