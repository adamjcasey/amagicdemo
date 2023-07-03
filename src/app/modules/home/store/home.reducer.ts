import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './home.store';
import * as fromActions from './home.actions';

export function HomeReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.HomeState {
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

const exportHome = (state: fromStore.HomeState) => state;
const selectHomeState = createFeatureSelector<fromStore.HomeState>('home');

export const getHomeState = createSelector(selectHomeState, exportHome);
