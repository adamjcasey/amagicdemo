import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromReducer from './shared.reducer';
import * as fromEffects from './shared.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('shared', fromReducer.SharedReducer),
    EffectsModule.forFeature(fromEffects.SharedEffects),
  ],
})
export class SharedStoreModule {}
