import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './shared.store';
import * as fromActions from './shared.actions';

export function SharedReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.SharedState {
  switch (action.type) {
    case fromActions.ActionTypes.BackdropTopShow: {
      return {
        ...state,
        backdropTopConfig: {
          ...state.backdropTopConfig,  
          ...action.payload,
          show: true,
        },
      };
    }
    case fromActions.ActionTypes.BackdropTopClose: {
      return {
        ...state,
        backdropTopConfig: {
          ...state.backdropTopConfig,
          show: false,
        },
      };
    }
    case fromActions.ActionTypes.BackdropTopOptions: {
      return {
        ...state,
        backdropTopConfig: {
          ...state.backdropTopConfig,
          transition: action.payload.transition,
          fullScreen: action.payload.fullScreen,
          header: action.payload.header,
        },
      };
    }
    case fromActions.ActionTypes.BackdropTopContent: {
      return {
        ...state,
        backdropTopConfig: {
          ...state.backdropTopConfig,
          template: action.payload?.template ? action.payload?.template : null,
          component: action.payload?.component ? action.payload?.component : null,
        }
      };
    }

    case fromActions.ActionTypes.BackdropBottomShow: {
      return {
        ...state,
        backdropBottomConfig: {
          ...state.backdropBottomConfig,  
          ...action.payload,
          show: true,
        },
      };
    }
    case fromActions.ActionTypes.BackdropBottomClose: {
      return {
        ...state,
        backdropBottomConfig: {
          ...state.backdropBottomConfig,
          show: false,
        },
      };
    }
    case fromActions.ActionTypes.BackdropBottomOptions: {
      return {
        ...state,
        backdropBottomConfig: {
          ...state.backdropBottomConfig,
          header: action.payload.header,
          toolbar: action.payload.toolbar,
        },
      };
    }
    case fromActions.ActionTypes.BackdropBottomContent: {
      return {
        ...state,
        backdropBottomConfig: {
          ...state.backdropBottomConfig,
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

const exportBackdropTopConfig = (state: fromStore.SharedState) => state.backdropTopConfig;
const exportBackdropBottomConfig = (state: fromStore.SharedState) => state.backdropBottomConfig;
const selectSharedState = createFeatureSelector<fromStore.SharedState>('shared');

export const getBackdropTopConfig = createSelector(selectSharedState, exportBackdropTopConfig);
export const getBackdropBottomConfig = createSelector(selectSharedState, exportBackdropBottomConfig);
