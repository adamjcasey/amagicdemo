import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './shared.store';
import * as fromActions from './shared.actions';

export function SharedReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion
): fromStore.SharedState {
  switch (action.type) {
    case fromActions.ActionTypes.OverlayShow: {
      return {
        ...state,
        showOverlay: true,
        overlayOptions: action.payload.options,
        overlayContent: action.payload.content
      };
    }
    case fromActions.ActionTypes.OverlayClose: {
      return {
        ...state,
        showOverlay: false,
      };
    }
    case fromActions.ActionTypes.OverlayOptions: {
      return {
        ...state,
        overlayOptions: action.payload,
      };
    }
    case fromActions.ActionTypes.OverlayContent: {
      return {
        ...state,
        overlayContent: action.payload,
      };
    }
    default: {
      return state;
    }
  }
}

const exportOverlayShow = (state: fromStore.SharedState) => state.showOverlay;
const exportOverlayOptions = (state: fromStore.SharedState) => state.overlayOptions;
const exportOverlayContent = (state: fromStore.SharedState) => state.overlayContent;
const selectSharedState = createFeatureSelector<fromStore.SharedState>('shared');

export const getOverlayShow = createSelector(selectSharedState, exportOverlayShow);
export const getOverlayOptions = createSelector(selectSharedState, exportOverlayOptions);
export const getOverlayContent = createSelector(selectSharedState, exportOverlayContent);
