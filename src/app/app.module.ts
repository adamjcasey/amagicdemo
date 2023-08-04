import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, GestureController } from '@ionic/angular';

import * as fromCore from '@core/index';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({
      mode: 'ios'
    }),
    fromCore.CoreModule
  ],
  providers: [
    { 
      provide: RouteReuseStrategy, 
      useClass: IonicRouteStrategy 
    },
  ],
  bootstrap: [fromCore.LayoutPage],
})
export class AppModule {}
