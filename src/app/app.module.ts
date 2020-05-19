import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChildComponent } from './child/child.component';
import { LibExampleComponent } from './lib-example/lib-example.component';

@NgModule({
  declarations: [AppComponent, ChildComponent, LibExampleComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
