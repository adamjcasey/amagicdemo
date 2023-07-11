import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SwiperModule } from 'swiper/angular';

import * as fromComponents from './components';
import * as fromPipes from './pipes';

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
    fromPipes.pipes,
  ],
  exports: [
    fromComponents.components,
    fromPipes.pipes,
  ],
})
export class SharedModule {}
