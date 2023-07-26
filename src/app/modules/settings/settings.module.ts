import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as fromPages from './pages';
import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SettingsRoutingModule,
    SharedModule
  ],
  declarations: [fromPages.pages]
})
export class SettingsModule {}
