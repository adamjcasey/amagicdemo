import * as fromRouter from '@ngrx/router-store';

import * as fromReducer from './core.reducer';

export interface CoreState {
  router: fromRouter.RouterReducerState<fromReducer.RouterState>;
}

export interface LayoutState {
  fullScreen: boolean;
  rightCornerEl: any,
  welcomeFlowDone: boolean;
  noDeviceMode: boolean;
  noDeviceModeOopsFlow: boolean;
  noDeviceModeBatteryLowFlow: boolean;
  debuggingDeviceMode: boolean;
  deviceModel?: any;
  isDeviceConnected: boolean;
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
  deviceModel: {
    name: 'iphone-14-pro',
    model: 'iphone15,2'
  }
}
