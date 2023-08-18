import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SwiperModule } from 'swiper/angular';

import * as fromComponents from './components';
import * as fromDirectives from './directives';
import * as fromPipes from './pipes';
import * as fromServices from './services';

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
    fromPipes.pipes,
  ],
  exports: [
    fromComponents.components,
    fromDirectives.directives,
    fromPipes.pipes,
  ],
  providers: [
    fromServices.services
  ],
})
export class SharedModule {}
