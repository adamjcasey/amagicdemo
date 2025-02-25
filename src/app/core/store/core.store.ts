import { Params, RouterStateSnapshot } from '@angular/router';
import * as fromNgrxRouter from '@ngrx/router-store';

import * as fromReducer from './core.reducer';

export interface RouterState {
  url: string,
  params: Params,
  queryParams: Params
}

export interface CoreState {
  // router?: fromNgrxRouter.RouterReducerState<RouterState>;
}
export const initialCoreState: CoreState = {}

export interface LayoutState {
  fullScreen: boolean;
  rightCornerEl: any,
  welcomeFlowDone: boolean;
  batteryLowAlertShownAt?: any;
  noDeviceMode: boolean;
  noDeviceModeOopsFlow: boolean;
  noDeviceModeBatteryLowFlow: boolean;
  debuggingDeviceMode: boolean;
  userDevice?: any;
  dosageDevice?: any;
}
export const initialLayoutState: LayoutState = {
  fullScreen: false,
  rightCornerEl: null,
  welcomeFlowDone: false,
  dosageDevice: {
    isConnected: false,
    battery: false,
  },
  noDeviceMode: true,
  noDeviceModeOopsFlow: false,
  noDeviceModeBatteryLowFlow: false,
  debuggingDeviceMode: false
}
