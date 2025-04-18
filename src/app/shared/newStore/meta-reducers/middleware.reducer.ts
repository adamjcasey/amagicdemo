import { ActionReducer, MetaReducer } from '@ngrx/store';
import { Storage } from '@ionic/storage';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { CoreState } from '@app/core/store';
import _ from "lodash";

function isLastDoseDateExist(state: any): boolean {
  return state?.home?.doses?.[5]?.date;
}

async function persistStoreInNativeDevice(storage: Storage, state: any) {
  let db = storage;
  if (Object.keys(state).length === 0) {
    db = await storage.create();
    environment.db = db;
  }
  db.set('state', JSON.stringify(state));

  if (isLastDoseDateExist(state)) {
    db.set('doses', JSON.stringify(state.home.doses));
  }
}

export function createMiddlewareReducer(
  storage: Storage
): MetaReducer<CoreState> {
  return (reducer: ActionReducer<CoreState>): ActionReducer<CoreState> => {
    return (state, action) => {
      const nextState = reducer(state, action);
      if (
        action.type === '@ngrx/store/update-reducers' ||
        action.type === '@ngrx/store-devtools/recompute' ||
        action.type === '@ngrx/effects/init' ||
        _.isEmpty(nextState)
      ) {
        console.log('------this is init state action ignore it to override persistent storage');
      } else if (Capacitor.isNativePlatform()) {
        persistStoreInNativeDevice(storage, nextState);
      } else {
        localStorage.setItem('state', JSON.stringify(nextState));
        if (isLastDoseDateExist(state)) {
          localStorage.setItem(
            'doses',
            JSON.stringify((nextState as any).home.doses)
          );
        }
      }
      return nextState;
    };
  };
}
