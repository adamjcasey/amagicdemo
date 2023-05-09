import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as fromPages from './pages';
import { StyleguidePageRoutingModule } from './styleguide-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StyleguidePageRoutingModule
  ],
  declarations: [fromPages.pages]
})
export class StyleguideModule {}
