import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-ngx-observable-lifecycle',
  template: `
    <p>
      ngx-observable-lifecycle works!
    </p>
  `,
  styles: [
  ]
})
export class NgxObservableLifecycleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
