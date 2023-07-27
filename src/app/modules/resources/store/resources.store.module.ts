import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromReducer from './resources.reducer';
import * as fromEffects from './resources.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('resources', fromReducer.ResourcesReducer),
    EffectsModule.forFeature(fromEffects.ResourcesEffects),
  ],
})
export class ResourcesStoreModule {}
