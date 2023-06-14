import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SwiperModule } from 'swiper/angular';

import * as fromComponents from './components';
import * as fromDirectives from './directives';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SwiperModule,
  ],
  declarations: [
    fromComponents.components,
    fromDirectives.directives,
  ],
  exports: [fromComponents.components]
})
export class SharedModule {}
