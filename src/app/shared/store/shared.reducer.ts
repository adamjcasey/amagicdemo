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
          component: null,
          template: null,
        },
      };
    }
    case fromActions.ActionTypes.BackdropConfig: {
      return {
        ...state,
        backdropConfig: {
          ...state.backdropConfig,
          fullScreen: action.payload.fullScreen,
          transition: action.payload.transition,
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
    case fromActions.ActionTypes.SliderPageExpandContent: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          content: action.payload,
        }
      };
    }
    default: {
      return state;
    }
  }
}

const exportBackdropConfig = (state: fromStore.SharedState) => state.backdropConfig;
const exportSliderPageConfig = (state: fromStore.SharedState) => state.sliderPageConfig;
const selectSharedState = createFeatureSelector<fromStore.SharedState>('shared');

export const getBackdropConfig = createSelector(selectSharedState, exportBackdropConfig);
export const getSliderPageConfig = createSelector(selectSharedState, exportSliderPageConfig);
