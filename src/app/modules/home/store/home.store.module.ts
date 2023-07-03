import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromReducer from './home.reducer';
import * as fromEffects from './home.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('home', fromReducer.HomeReducer),
    EffectsModule.forFeature(fromEffects.HomeEffects),
  ],
})
export class HomeStoreModule {}
