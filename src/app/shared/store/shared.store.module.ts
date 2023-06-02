import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromReducer from './shared.reducer';

@NgModule({
  imports: [
    StoreModule.forFeature('shared', fromReducer.SharedReducer),
    EffectsModule.forFeature({}),
  ],
})
export class SharedStoreModule {}
  