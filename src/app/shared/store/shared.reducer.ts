import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromActions from './shared.actions';
import * as fromStore from './shared.store';

export function SharedReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion
): fromStore.SharedState {
  switch (action.type) {
    case fromActions.ActionTypes.SliderPageSetHeader: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          header: {
            ...fromStore.initialState.sliderPageConfig.header,
            ...action.payload,
          },
        },
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
          },
        },
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
          },
        },
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
          },
        },
      };
    }
    case fromActions.ActionTypes.SliderPageClear: {
      return {
        ...state,
        sliderPageConfig: {
          ...fromStore.initialState.sliderPageConfig,
        },
      };
    }
    case fromActions.ActionTypes.SliderPageSlidePrev: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          movePrev: true,
        },
      };
    }
    case fromActions.ActionTypes.SliderPageSlideNext: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          moveNext: true,
        },
      };
    }
    case fromActions.ActionTypes.SliderPageSlideTo: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          moveTo: action.payload,
        },
      };
    }
    case fromActions.ActionTypes.SliderPageClearMovement: {
      return {
        ...state,
        sliderPageConfig: {
          ...state.sliderPageConfig,
          moveTo: null,
          movePrev: null,
          moveNext: null,
        },
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
    case fromActions.ActionTypes.AlertHide: {
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
          component: action.payload?.component
            ? action.payload?.component
            : null,
        },
      };
    }

    case fromActions.ActionTypes.OverlayShow: {
      return {
        ...state,
        overlayConfig: {
          ...fromStore.initialState.overlayConfig,
          ...action.payload,
          show: true,
        },
      };
    }
    case fromActions.ActionTypes.OverlayHide: {
      return {
        ...state,
        overlayConfig: {
          ...state.overlayConfig,
          show: false,
        },
      };
    }
    case fromActions.ActionTypes.OverlaySetConfig: {
      return {
        ...state,
        overlayConfig: {
          ...state.overlayConfig,
          ...action.payload,
          template: action.payload?.template ? action.payload?.template : null,
          component: action.payload?.component
            ? action.payload?.component
            : null,
        },
      };
    }

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
    case fromActions.ActionTypes.BackdropHide: {
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
          component: action.payload?.component
            ? action.payload?.component
            : null,
        },
      };
    }

    case fromActions.ActionTypes.BottomToolbarShow: {
      return {
        ...state,
        bottomToolbarConfig: {
          show: true,
        },
      };
    }
    case fromActions.ActionTypes.BottomToolbarHide: {
      return {
        ...state,
        bottomToolbarConfig: {
          show: false,
        },
      };
    }

    case fromActions.ActionTypes.TopbarChangeColor: {
      return {
        ...state,
        topbarConfig: {
          ...state.topbarConfig,
          bgColor: action.payload,
        },
      };
    }
    case fromActions.ActionTypes.TopbarPendingNotifications: {
      return {
        ...state,
        topbarConfig: {
          ...state.topbarConfig,
          pendingNotifications: action.payload,
        },
      };
    }

    default: {
      return state;
    }
  }
}

const exportBackdropSetConfig = (state: fromStore.SharedState) =>
  state.backdropConfig;
const exportSliderPageConfig = (state: fromStore.SharedState) =>
  state.sliderPageConfig;
const exportAlertConfig = (state: fromStore.SharedState) => state.alertConfig;
const exportOverlayConfig = (state: fromStore.SharedState) =>
  state.overlayConfig;
const exportBottomToolbarConfig = (state: fromStore.SharedState) =>
  state.bottomToolbarConfig;
const exportTopbarConfig = (state: fromStore.SharedState) => state.topbarConfig;
const selectSharedState =
  createFeatureSelector<fromStore.SharedState>('shared');

export const getBackdropConfig = createSelector(
  selectSharedState,
  exportBackdropSetConfig
);
export const getSliderPageConfig = createSelector(
  selectSharedState,
  exportSliderPageConfig
);
export const getAlertConfig = createSelector(
  selectSharedState,
  exportAlertConfig
);
export const getOverlayConfig = createSelector(
  selectSharedState,
  exportOverlayConfig
);
export const getBottomToolbarConfig = createSelector(
  selectSharedState,
  exportBottomToolbarConfig
);
export const getTopbarConfig = createSelector(
  selectSharedState,
  exportTopbarConfig
);
