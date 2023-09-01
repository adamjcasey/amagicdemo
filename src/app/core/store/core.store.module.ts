import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, ActionReducer, MetaReducer, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { storeLogger } from '@shared/services/logger';

import * as fromStore from './core.store';
import * as fromReducer from './core.reducer';
import * as fromEffects from './core.effects';
import { environment } from 'src/environments/environment';
import { SharedStoreModule } from '@shared/store';
import { WelcomeStoreModule } from '@welcome/store';
import { HomeStoreModule } from '@home/store';
import { ActivityStoreModule } from '@activity/store';
import { SettingsStoreModule } from '@settings/store';
import { ResourcesStoreModule } from '@resources/store';

export function clearState(reducer: any) {
  return function (state: any, action: Action) {
    // if (action.type === fromStoreLogin.ActionTypes.Logout) {
    //   state = {}
    // }
    return reducer(state, action);
  }
}

export function logger(
  reducer: ActionReducer<fromStore.CoreState>
): ActionReducer<fromStore.CoreState> {
  return storeLogger()(reducer);
}

export const metaReducers: MetaReducer<fromStore.CoreState>[] = 
  !environment.production
  // ? [logger]
  ? []
  : [];
metaReducers.push(clearState);

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(fromReducer.CoreReducers, { metaReducers: metaReducers }),
    StoreModule.forFeature('layout', fromReducer.LayoutReducer),
    EffectsModule.forRoot(fromEffects.CoreEffects),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    SharedStoreModule,
    WelcomeStoreModule,
    HomeStoreModule,
    ActivityStoreModule,
    SettingsStoreModule,
    ResourcesStoreModule,
  ],
})
export class CoreStoreModule {}
