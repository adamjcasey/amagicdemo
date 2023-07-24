import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './activity.store';
import * as fromActions from './activity.actions';

export function ActivityReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.ActivityState {
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

const exportActivity = (state: fromStore.ActivityState) => state;
const selectActivityConfig = createFeatureSelector<fromStore.ActivityState>('activity');

export const getActivityConfig = createSelector(selectActivityConfig, exportActivity);
