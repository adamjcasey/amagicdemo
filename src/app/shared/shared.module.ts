import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import * as fromComponents from './components';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [fromComponents.components],
  exports: [fromComponents.components]
})
export class SharedModule {}
