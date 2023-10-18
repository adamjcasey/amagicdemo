import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Drivers, Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

import * as fromCore from '@core/index';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({
      mode: 'ios',
      innerHTMLTemplatesEnabled: true,
    }),
    IonicStorageModule.forRoot({
      name: '__automagic_ally',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
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
