import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import * as fromPages from './pages';
import { CoreRouting } from './core.routing';
import { CoreStoreModule } from './store';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [...fromPages.pages],
  imports: [ 
    CommonModule,
    IonicModule,
    CoreRouting,
    CoreStoreModule,
    SharedModule,
  ],
  exports: [...fromPages.pages]
})
export class CoreModule {}
