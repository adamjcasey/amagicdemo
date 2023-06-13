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
        backdropTopConfig: {
          ...state.backdropTopConfig,  
          ...action.payload,
          show: true,
          // fullScreen: action.payload.fullScreen,
          // transition: action.payload.transition,
          // header: action.payload.header,
          // template: action.payload.template,
          // component: action.payload.component,
        },
      };
    }
    case fromActions.ActionTypes.BackdropTopClose: {
      return {
        backdropTopConfig: {
          ...state.backdropTopConfig,
          show: false,
        },
      };
    }
    case fromActions.ActionTypes.BackdropTopOptions: {
      return {
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
        backdropTopConfig: {
          ...state.backdropTopConfig,
          template: action.payload?.template ? action.payload?.template : null,
          component: action.payload?.component ? action.payload?.template : null,
        }
      };
    }

    case fromActions.ActionTypes.BackdropBottomShow: {
      return {
        backdropBottomConfig: {
          ...state.backdropBottomConfig,  
          ...action.payload,
          show: true,
          // header: action.payload.header,
          // template: action.payload.template,
          // component: action.payload.component,
          // controls: action.payload.controls,
        },
      };
    }
    case fromActions.ActionTypes.BackdropBottomClose: {
      return {
        backdropBottomConfig: {
          ...state.backdropBottomConfig,
          show: false,
        },
      };
    }
    case fromActions.ActionTypes.BackdropBottomOptions: {
      return {
        backdropBottomConfig: {
          ...state.backdropBottomConfig,
          header: action.payload.header,
          controls: action.payload.controls,
        },
      };
    }
    case fromActions.ActionTypes.BackdropBottomContent: {
      return {
        backdropBottomConfig: {
          ...state.backdropBottomConfig,
          template: action.payload?.template,
          component: action.payload?.component,
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
