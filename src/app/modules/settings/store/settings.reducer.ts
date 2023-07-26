import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './settings.store';
import * as fromActions from './settings.actions';

export function SettingsReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.SettingsState {
  switch (action.type) {
    case fromActions.ActionTypes.SetData: {
      return {
        ...state,
        ...action.payload,
      };
    }

    default: {
      return state;
    }
  }
}

const exportSettings = (state: fromStore.SettingsState) => state;
const selectSettingsConfig = createFeatureSelector<fromStore.SettingsState>('settings');

export const getSettingsConfig = createSelector(selectSettingsConfig, exportSettings);
