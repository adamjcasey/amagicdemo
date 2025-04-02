import { Action } from '@ngrx/store';
import { DeviceStateCode } from '../constants/bluetooth.constants';
import { MockScenario } from '../models/bluetooth-mock.models';

export enum BluetoothActionTypes {
  Connect = '[Bluetooth] Connect',
  ConnectSuccess = '[Bluetooth] Connect Success',
  ConnectFailure = '[Bluetooth] Connect Failure',
  ConnectionInProgress = '[Bluetooth] Connection In Progress',
  SetConnectionInProgress = '[Bluetooth] Set Connection In Progress',

  Disconnect = '[Bluetooth] Disconnect',
  DisconnectSuccess = '[Bluetooth] Disconnect Success',
  DisconnectFailure = '[Bluetooth] Disconnect Failure',

  StartScan = '[Bluetooth] Start Scan',
  StopScan = '[Bluetooth] Stop Scan',
  DeviceFound = '[Bluetooth] Device Found',

  UpdateDeviceState = '[Bluetooth] Update Device State',
  UpdateDeviceStateData = '[Bluetooth] Update Device State Data',
  UpdateBatteryLevel = '[Bluetooth] Update Battery Level',
  UpdateDeviceInfo = '[Bluetooth] Update Device Info',

  CheckPermissions = '[Bluetooth] Check Permissions',
  PermissionsResult = '[Bluetooth] Permissions Result',
  OpenSettings = '[Bluetooth] Open Settings',

  SetError = '[Bluetooth] Set Error',

  InitializeBluetoothState = '[Bluetooth] Initialize State',

  MockDeviceState = '[Bluetooth] Mock Device State',
  StartMockScenario = '[Bluetooth] Start Mock Scenario',
  StopMockScenario = '[Bluetooth] Stop Mock Scenario',
  CreateMockScenario = '[Bluetooth] Create Mock Scenario',
  MockScenarioStepExecuted = '[Bluetooth] Mock Scenario Step Executed',

  IncrementSuccessfulDoses = '[Bluetooth] Increment Successful Doses',
}

export class Connect implements Action {
  readonly type = BluetoothActionTypes.Connect;
  constructor(public payload?: any) {}
}

export class ConnectSuccess implements Action {
  readonly type = BluetoothActionTypes.ConnectSuccess;
  constructor(public payload: any) {}
}

export class ConnectFailure implements Action {
  readonly type = BluetoothActionTypes.ConnectFailure;
  constructor(public payload: any) {}
}

export class ConnectionInProgress implements Action {
  readonly type = BluetoothActionTypes.ConnectionInProgress;
}

export class SetConnectionInProgress implements Action {
  readonly type = BluetoothActionTypes.SetConnectionInProgress;
  constructor(public payload: boolean) {}
}

export class Disconnect implements Action {
  readonly type = BluetoothActionTypes.Disconnect;
}

export class DisconnectSuccess implements Action {
  readonly type = BluetoothActionTypes.DisconnectSuccess;
}

export class DisconnectFailure implements Action {
  readonly type = BluetoothActionTypes.DisconnectFailure;
  constructor(public payload: any) {}
}

export class StartScan implements Action {
  readonly type = BluetoothActionTypes.StartScan;
}

export class StopScan implements Action {
  readonly type = BluetoothActionTypes.StopScan;
}

export class DeviceFound implements Action {
  readonly type = BluetoothActionTypes.DeviceFound;
  constructor(public payload: any) {}
}

export class UpdateDeviceState implements Action {
  readonly type = BluetoothActionTypes.UpdateDeviceState;
  constructor(public payload: number) {}
}

export class UpdateDeviceStateData implements Action {
  readonly type = BluetoothActionTypes.UpdateDeviceStateData;
  constructor(public payload: number) {}
}

export class UpdateBatteryLevel implements Action {
  readonly type = BluetoothActionTypes.UpdateBatteryLevel;
  constructor(public payload: number) {}
}

export class UpdateDeviceInfo implements Action {
  readonly type = BluetoothActionTypes.UpdateDeviceInfo;
  constructor(
    public payload: {
      manufacturer?: string;
      model?: string;
      serial?: string;
      softwareRevision?: string;
      hardwareRevision?: string;
      name?: string;
      rssi?: number;
    }
  ) {}
}

export class CheckPermissions implements Action {
  readonly type = BluetoothActionTypes.CheckPermissions;
}

export class PermissionsResult implements Action {
  readonly type = BluetoothActionTypes.PermissionsResult;
  constructor(public payload: 'granted' | 'not-allowed') {}
}

export class OpenSettings implements Action {
  readonly type = BluetoothActionTypes.OpenSettings;
}

export class SetError implements Action {
  readonly type = BluetoothActionTypes.SetError;
  constructor(public payload: any) {}
}

export class InitializeBluetoothState implements Action {
  readonly type = BluetoothActionTypes.InitializeBluetoothState;
  constructor(
    public payload: {
      isNativePlatform: boolean;
      isVirtualDevice: boolean;
      useMockDevice: boolean;
      deviceInfo: {
        manufacturer?: string;
        model?: string;
        serial?: string;
        softwareRevision?: string;
        hardwareRevision?: string;
        name?: string;
        rssi?: number;
      };
    }
  ) {}
}

export class MockDeviceState implements Action {
  readonly type = BluetoothActionTypes.MockDeviceState;
  constructor(public payload: number) {}
}

export class StartMockScenario implements Action {
  readonly type = BluetoothActionTypes.StartMockScenario;
  constructor(public payload: string) {}
}

export class StopMockScenario implements Action {
  readonly type = BluetoothActionTypes.StopMockScenario;
}

export class CreateMockScenario implements Action {
  readonly type = BluetoothActionTypes.CreateMockScenario;
  constructor(public payload: MockScenario) {}
}

export class MockScenarioStepExecuted implements Action {
  readonly type = BluetoothActionTypes.MockScenarioStepExecuted;
  constructor(
    public payload: {
      stepIndex: number;
      totalSteps: number;
      state: DeviceStateCode;
    }
  ) {}
}

export class IncrementSuccessfulDoses implements Action {
  readonly type = BluetoothActionTypes.IncrementSuccessfulDoses;
}

export type BluetoothActions =
  | Connect
  | ConnectSuccess
  | ConnectFailure
  | ConnectionInProgress
  | SetConnectionInProgress
  | Disconnect
  | DisconnectSuccess
  | DisconnectFailure
  | StartScan
  | StopScan
  | DeviceFound
  | UpdateDeviceState
  | UpdateDeviceStateData
  | UpdateBatteryLevel
  | UpdateDeviceInfo
  | CheckPermissions
  | PermissionsResult
  | OpenSettings
  | SetError
  | InitializeBluetoothState
  | MockDeviceState
  | StartMockScenario
  | StopMockScenario
  | CreateMockScenario
  | MockScenarioStepExecuted
  | IncrementSuccessfulDoses;
