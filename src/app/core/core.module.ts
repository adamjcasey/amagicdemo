import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CoreRouting } from './core.routing';
import { SharedModule } from '@shared/shared.module';
import * as fromPages from './pages';

@NgModule({
  declarations: [...fromPages.pages],
  imports: [ 
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    CoreRouting,
  ],
  exports: [...fromPages.pages]
})
export class CoreModule {}

