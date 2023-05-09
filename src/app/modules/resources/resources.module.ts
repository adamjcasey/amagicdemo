import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as fromPages from './pages';
import { ResourcesRoutingModule } from './resources-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ResourcesRoutingModule
  ],
  declarations: [fromPages.pages]
})
export class ResourcesModule {}
