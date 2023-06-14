import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './welcome.store';
import * as fromActions from './welcome.actions';

export function WelcomeReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.WelcomeState {
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

const exportWelcome = (state: fromStore.WelcomeState) => state;
const selectWelcomeState = createFeatureSelector<fromStore.WelcomeState>('welcome');

export const getWelcomeState = createSelector(selectWelcomeState, exportWelcome);
