import {
  Action,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { Params, RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer, routerReducer } from '@ngrx/router-store';

import * as fromStore from './core.store';
import * as fromActions from './core.actions';

// export function CoreReducer(
//   state = fromStore.initialCoreState,
//   action: fromActions.ActionsUnion,
// ): fromStore.CoreState {
//   switch (action.type) {
//     case fromActions.ActionTypes.SetStore: {
//       return {
//         ...action.payload,
//       };
//     }

//     default: {
//       return state;
//     }
//   }
// }

export function CoreReducer(
  state: fromStore.CoreState = fromStore.initialCoreState,
  action: Action
): fromStore.CoreState {
  const typedAction = action as fromActions.ActionsUnion;

  switch (typedAction.type) {
    case fromActions.ActionTypes.SetStore:
      return {
        ...typedAction.payload,
      };
    default:
      return state;
  }
}

export function LayoutReducer(
  state = fromStore.initialLayoutState,
  action: fromActions.ActionsUnion
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

    case fromActions.ActionTypes.SetUserDeviceInfo: {
      return {
        ...state,
        userDevice: {
          ...state.userDevice,
          ...action.payload,
        },
      };
    }

    case fromActions.ActionTypes.SetDosageDeviceInfo: {
      return {
        ...state,
        dosageDevice: {
          ...state.dosageDevice,
          ...action.payload,
        },
      };
    }

    case fromActions.ActionTypes.SetBatteryLowAlertShownAt: {
      return {
        ...state,
        batteryLowAlertShownAt: action.payload,
      };
    }

    default: {
      return state;
    }
  }
}

const exportLayout = (state: fromStore.LayoutState) => state;
const selectLayoutState =
  createFeatureSelector<fromStore.LayoutState>('layout');

export const getLayoutConfig = createSelector(selectLayoutState, exportLayout);
