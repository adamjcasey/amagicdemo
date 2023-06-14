import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromReducer from './welcome.reducer';
import * as fromEffects from './welcome.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('welcome', fromReducer.WelcomeReducer),
    EffectsModule.forFeature(fromEffects.WelcomeEffects),
  ],
})
export class WelcomeStoreModule {}
