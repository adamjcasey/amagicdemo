import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from 'swiper/angular';

import * as fromPages from './pages';
import * as fromComponents from './components';
import { WelcomeRoutingModule } from './welcome-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SwiperModule,
    SharedModule,
    WelcomeRoutingModule,
  ],
  declarations: [
    fromPages.pages,
    fromComponents.components
  ],
})
export class WelcomeModule {}
