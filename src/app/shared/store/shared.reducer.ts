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
          ...fromStore.initialState.backdropConfig, 
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
    case fromActions.ActionTypes.BackdropSetConfig: {
      return {
        ...state,
        backdropConfig: {
          ...state.backdropConfig,
          ...action.payload,
          template: action.payload?.template ? action.payload?.template : null,
          component: action.payload?.component ? action.payload?.component : null,
        },
      };
    }

    case fromActions.ActionTypes.SliderPageSetHeader: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          header: {
            ...fromStore.initialState.sliderPageConfig.header,
            ...action.payload,
          }
        }
      };
    }
    case fromActions.ActionTypes.SliderPageSetHeaderOptions: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          header: {
            ...state.sliderPageConfig.header,
            ...action.payload,
          }
        }
      };
    }
    case fromActions.ActionTypes.SliderPageSetContent: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          content: {
            ...fromStore.initialState.sliderPageConfig.content,
            ...action.payload,
          }
        }
      };
    }
    case fromActions.ActionTypes.SliderPageSetContentOptions: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          content: {
            ...state.sliderPageConfig.content,
            ...action.payload,
          }
        }
      };
    }
    case fromActions.ActionTypes.SliderPageClear: {
      return {
        ...state,
        sliderPageConfig: {
          ...fromStore.initialState.sliderPageConfig
        }
      };
    }

    case fromActions.ActionTypes.AlertShow: {
      return {
        ...state,
        alertConfig: {
          ...fromStore.initialState.alertConfig, 
          ...action.payload,
          show: true,
        },
      };
    }
    case fromActions.ActionTypes.AlertClose: {
      return {
        ...state,
        alertConfig: {
          ...state.alertConfig,
          show: false,
        },
      };
    }
    case fromActions.ActionTypes.AlertSetConfig: {
      return {
        ...state,
        alertConfig: {
          ...state.alertConfig,
          ...action.payload,
          template: action.payload?.template ? action.payload?.template : null,
          component: action.payload?.component ? action.payload?.component : null,
        },
      };
    }

    default: {
      return state;
    }
  }
}

const exportBackdropSetConfig = (state: fromStore.SharedState) => state.backdropConfig;
const exportSliderPageConfig = (state: fromStore.SharedState) => state.sliderPageConfig;
const exportAlertConfig = (state: fromStore.SharedState) => state.alertConfig;
const selectSharedState = createFeatureSelector<fromStore.SharedState>('shared');

export const getBackdropConfig = createSelector(selectSharedState, exportBackdropSetConfig);
export const getSliderPageConfig = createSelector(selectSharedState, exportSliderPageConfig);
export const getAlertConfig = createSelector(selectSharedState, exportAlertConfig);
