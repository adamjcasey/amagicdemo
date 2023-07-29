import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import * as fromPages from './pages';
import * as fromComponents from './components';
import { CoreRouting } from './core.routing';
import { CoreStoreModule } from './store';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ...fromPages.pages,
    ...fromComponents.components,
  ],
  imports: [ 
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CoreRouting,
    CoreStoreModule,
    SharedModule,
  ],
})
export class CoreModule {}
