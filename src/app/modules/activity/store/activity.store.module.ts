import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromReducer from './activity.reducer';
import * as fromEffects from './activity.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('activity', fromReducer.ActivityReducer),
    EffectsModule.forFeature(fromEffects.ActivityEffects),
  ],
})
export class ActivityStoreModule {}
