import * as fromRouter from '@ngrx/router-store';

import * as fromReducer from './core.reducer';

export interface CoreState {
  router: fromRouter.RouterReducerState<fromReducer.RouterState>;
}

export interface LayoutState {
  fullScreen: boolean;
  rightCornerEl: any,
  welcomeFlowDone: boolean;
  batteryLowAlertShownAt?: any;
  noDeviceMode: boolean;
  noDeviceModeOopsFlow: boolean;
  noDeviceModeBatteryLowFlow: boolean;
  debuggingDeviceMode: boolean;
  device?: any;
  isDeviceConnected: boolean;
  batteryLevel: number,
}

export const initialState: LayoutState = {
  fullScreen: false,
  rightCornerEl: null,
  welcomeFlowDone: false,
  noDeviceMode: false,
  noDeviceModeOopsFlow: false,
  noDeviceModeBatteryLowFlow: false,
  debuggingDeviceMode: false,
  isDeviceConnected: false,
  batteryLevel: 0,
  device: {
    name: 'iphone-14-pro',
    model: 'iphone10,4'
  }
}
