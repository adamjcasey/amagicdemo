import { Action } from '@ngrx/store';
import { NavigationExtras } from '@angular/router';

export enum ActionTypes {
  Go = '[Router] Go',
  Back = '[Router] Back',
  Forward = '[Router] Forward',
  SetFullScreen = '[Layout] Set FullScreen',
  SetRightCornerEl = '[Layout] Set Right Corner Element',
  ClearRightCornerEl = '[Layout] Clear Right Corner Element',
  SetNoDeviceMode = '[Layout] Set No Device Mode',
  SetNoDeviceModeOopsFlow = '[Layout] Set No Device Mode Oops Flow',
  SetNoDeviceModeBatteryLowFlow = '[Layout] Set No Device Mode Battery Low Flow',
  SetDeviceDebugging = '[Layout] Set Device Debugging',
  SetWelcomeFlowAsDone = '[Layout] Set Welcome Flow as Done',
  SetDeviceModelInfo = '[Layout] Set Device Model Info',
}

export class Go implements Action {
  readonly type = ActionTypes.Go;

  constructor(public payload: {
    path: any[];
    query?: object;
    extras?: NavigationExtras;
  }) {}
}

export class Back implements Action {
  readonly type = ActionTypes.Back;
}

export class Forward implements Action {
  readonly type = ActionTypes.Forward;
}

export class SetFullScreen implements Action {
  readonly type = ActionTypes.SetFullScreen;
  constructor(public payload: boolean) {}
}

export class SetRightCornerEl implements Action {
  readonly type = ActionTypes.SetRightCornerEl;
  constructor(public payload: any) {}
}

export class ClearRightCornerEl implements Action {
  readonly type = ActionTypes.ClearRightCornerEl;
}

export class SetNoDeviceMode implements Action {
  readonly type = ActionTypes.SetNoDeviceMode;
  constructor(public payload: boolean) {}
}

export class SetNoDeviceModeOopsFlow implements Action {
  readonly type = ActionTypes.SetNoDeviceModeOopsFlow;
  constructor(public payload: boolean) {}
}

export class SetNoDeviceModeBatteryLowFlow implements Action {
  readonly type = ActionTypes.SetNoDeviceModeBatteryLowFlow;
  constructor(public payload: boolean) {}
}

export class SetDeviceDebugging implements Action {
  readonly type = ActionTypes.SetDeviceDebugging;
  constructor(public payload: boolean) {}
}

export class SetWelcomeFlowAsDone implements Action {
  readonly type = ActionTypes.SetWelcomeFlowAsDone;
}


export class SetDeviceModelInfo implements Action {
  readonly type = ActionTypes.SetDeviceModelInfo;
  constructor(public payload: string) {}
}

export type ActionsUnion 
  = Go 
  | Back
  | Forward
  | SetFullScreen
  | SetRightCornerEl
  | ClearRightCornerEl
  | SetNoDeviceMode
  | SetNoDeviceModeOopsFlow
  | SetNoDeviceModeBatteryLowFlow
  | SetWelcomeFlowAsDone
  | SetDeviceDebugging
  | SetDeviceModelInfo;
