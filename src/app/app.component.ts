import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'ngx-observable-lifecycle';

  inputValue = 0;
  showChildComponent = true;
  showLibExampleComponent = false;
}
