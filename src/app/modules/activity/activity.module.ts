import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as fromComponents from './components';
import * as fromPages from './pages';
import { ActivityRoutingModule } from './activity-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ActivityRoutingModule,
    SharedModule,
  ],
  declarations: [
    fromPages.pages,
    fromComponents.components,
  ]
})
export class ActivityModule {}
