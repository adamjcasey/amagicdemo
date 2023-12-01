import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, ActionReducer, MetaReducer, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { Storage } from '@ionic/storage';
import { Capacitor } from '@capacitor/core';

import * as fromActions from './core.actions';
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
import { storeLogger } from '@shared/services/logger';

export function clearState(reducer: any) {
  return function (state: any, action: any) {
    if (action.type === fromActions.ActionTypes.ClearStore) {
      state = Capacitor.isNativePlatform() ? {
        layout: {
          userDevice: state.layout.userDevice ? {
            name: state.layout.userDevice.name,
            model: state.layout.userDevice.model,
          } : null,
        },
        welcome: {
          bleAllowed: state.welcome.bleAllowed ? state.welcome.bleAllowed : null,
          notificationsAllowed: state.welcome.notificationsAllowed ? state.welcome.notificationsAllowed : null,
        },
      } : {}
    }
    // else if (action.type === fromActions.ActionTypes.SetStore) {
    //   if (action.payload) {
    //     state = action.payload;
    //   }
    // }
    return reducer(state, action);
  }
}

export function logger(
  reducer: ActionReducer<fromStore.CoreState>
): ActionReducer<fromStore.CoreState> {
  return storeLogger()(reducer);
}

const persistStoreInNativeDevice = async (storage: Storage, state: any) => {
  let db = storage;
  if (Object.keys(state).length === 0) {
    db = await storage.create();
    environment.db = db;
  }
  db.set('state', JSON.stringify(state));
  
  if(isLastDoseDateExist(state)) {
    db.set('doses', JSON.stringify(state.home.doses));
  }
}

function isLastDoseDateExist(state: any): boolean {
  return state?.home?.doses?.[5]?.date;
}

export function middlewareReducer(storage: Storage): MetaReducer<fromStore.CoreState> {
  return (reducer: ActionReducer<fromStore.CoreState>): ActionReducer<fromStore.CoreState> => {
    return (state, action) => {
      const nextState = reducer(state, action);
      if (Capacitor.isNativePlatform()) {
        persistStoreInNativeDevice(storage, nextState);
      }
      else {
        localStorage.setItem('state', JSON.stringify(nextState));
        if(isLastDoseDateExist(state)) {
          localStorage.setItem('doses', JSON.stringify((nextState as any).home.doses));
        }
      }
      return nextState;
    };
  };
}

export const metaReducers: MetaReducer<fromStore.CoreState>[] = 
  !environment.production
  ? [logger]
  : [];
metaReducers.push(clearState);

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(fromReducer.CoreReducer, { metaReducers: [
      ...metaReducers,
      middlewareReducer(new Storage({ name: 'automagic_ally' }))
    ]}),
    StoreModule.forFeature('layout', fromReducer.LayoutReducer),
    EffectsModule.forRoot(fromEffects.CoreEffects),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      connectInZone: true
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
