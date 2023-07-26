import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromReducer from './settings.reducer';
import * as fromEffects from './settings.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('settings', fromReducer.SettingsReducer),
    EffectsModule.forFeature(fromEffects.SettingsEffects),
  ],
})
export class SettingsStoreModule {}
