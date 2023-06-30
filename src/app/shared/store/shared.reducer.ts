import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './shared.store';
import * as fromActions from './shared.actions';

export function SharedReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.SharedState {
  switch (action.type) {
    case fromActions.ActionTypes.BackdropShow: {
      return {
        ...state,
        backdropConfig: {
          ...state.backdropConfig,  
          ...action.payload,
          show: true,
        },
      };
    }
    case fromActions.ActionTypes.BackdropClose: {
      return {
        ...state,
        backdropConfig: {
          ...state.backdropConfig,
          show: false,
        },
      };
    }
    case fromActions.ActionTypes.BackdropConfig: {
      return {
        ...state,
        backdropConfig: {
          ...state.backdropConfig,
          transition: action.payload.transition,
          fullScreen: action.payload.fullScreen,
          header: action.payload.header,
        },
      };
    }
    case fromActions.ActionTypes.BackdropContent: {
      return {
        ...state,
        backdropConfig: {
          ...state.backdropConfig,
          template: action.payload?.template ? action.payload?.template : null,
          component: action.payload?.component ? action.payload?.component : null,
        }
      };
    }
    default: {
      return state;
    }
  }
}

const exportBackdropConfig = (state: fromStore.SharedState) => state.backdropConfig;
const selectSharedState = createFeatureSelector<fromStore.SharedState>('shared');

export const getBackdropConfig = createSelector(selectSharedState, exportBackdropConfig);
