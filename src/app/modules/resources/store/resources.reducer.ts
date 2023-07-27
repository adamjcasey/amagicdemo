import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStore from './resources.store';
import * as fromActions from './resources.actions';

export function ResourcesReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.ResourcesState {
  switch (action.type) {
    case fromActions.ActionTypes.SetData: {
      return {
        ...state,
        ...action.payload,
      };
    }
    
    case fromActions.ActionTypes.UpdateCareTeam: {
      return {
        ...state,
        yourCareTeam: {
          ...state.yourCareTeam,
          ...action.payload,
        }
      };
    }

    case fromActions.ActionTypes.MemberYouCareTeamSelected: {
      return {
        ...state,
        yourCareTeam: {
          ...state.yourCareTeam,
          memberSelected: action.payload,
        }
      };
    }

    default: {
      return state;
    }
  }
}

const exportResources = (state: fromStore.ResourcesState) => state;
const selectResourcesConfig = createFeatureSelector<fromStore.ResourcesState>('resources');

export const getResourcesConfig = createSelector(selectResourcesConfig, exportResources);
