import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { Params, RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer, routerReducer } from '@ngrx/router-store';

import * as fromStore from './core.store';
import * as fromActions from './core.actions';

export interface RouterState {
  url: string,
  params: Params,
  queryParams: Params
}

export class CustomRouterStateSerializer implements RouterStateSerializer<RouterState> {
  serialize(routerState: RouterStateSnapshot): RouterState {
    let route = routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const { url, root: { queryParams } } = routerState;
    const { params } = route;

    return { url, params, queryParams };
  }
}

export const CoreReducers: ActionReducerMap<fromStore.CoreState> = {
  router: routerReducer
};


export function LayoutReducer(
  state = fromStore.initialState,
  action: fromActions.ActionsUnion,
): fromStore.LayoutState {
  switch (action.type) {
    case fromActions.ActionTypes.SetFullScreen: {
      return {
        ...state,
        fullScreen: action.payload,
      };
    }

    case fromActions.ActionTypes.SetRightCornerEl: {
      return {
        ...state,
        rightCornerEl: {
          ...state.rightCornerEl,
          ...action.payload,
        },
      };
    }

    case fromActions.ActionTypes.ClearRightCornerEl: {
      return {
        ...state,
        rightCornerEl: null,
      };
    }

    case fromActions.ActionTypes.SetBatteryLowAlertShownAt: {
      return {
        ...state,
        batteryLowAlertShownAt: action.payload,
      };
    }

    case fromActions.ActionTypes.SetNoDeviceMode: {
      return {
        ...state,
        noDeviceMode: action.payload,
      };
    }

    case fromActions.ActionTypes.SetNoDeviceModeOopsFlow: {
      return {
        ...state,
        noDeviceModeOopsFlow: action.payload,
      };
    }

    case fromActions.ActionTypes.SetNoDeviceModeBatteryLowFlow: {
      return {
        ...state,
        noDeviceModeBatteryLowFlow: action.payload,
      };
    }

    case fromActions.ActionTypes.SetDeviceDebugging: {
      return {
        ...state,
        debuggingDeviceMode: action.payload,
      };
    }

    case fromActions.ActionTypes.SetWelcomeFlowAsDone: {
      return {
        ...state,
        welcomeFlowDone: true,
      };
    }

    case fromActions.ActionTypes.SetDeviceInfo: {
      return {
        ...state,
        device: action.payload,
      };
    }

    case fromActions.ActionTypes.SetIsDeviceConnected: {
      return {
        ...state,
        isDeviceConnected: action.payload,
      };
    }

    case fromActions.ActionTypes.SetBatteryOfDevice: {
      return {
        ...state,
        batteryLevel: action.payload,
      };
    }

    default: {
      return state;
    }
  }
}

const exportLayout = (state: fromStore.LayoutState) => state;
const selectLayoutState = createFeatureSelector<fromStore.LayoutState>('layout');

export const getLayoutConfig = createSelector(selectLayoutState, exportLayout);

