import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as fromPages from './pages';
import { StyleguideRoutingModule } from './styleguide-routing.module';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StyleguideRoutingModule,
    SharedModule,
  ],
  declarations: [fromPages.pages]
})
export class StyleguideModule {}
