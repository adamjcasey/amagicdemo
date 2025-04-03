import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  DeviceStateCode,
  STATUS_NAMES,
} from '../constants/bluetooth.constants';
import * as fromActions from './bluetooth.actions';
import { BluetoothState, initialBluetoothState } from './bluetooth.store';

export function bluetoothReducer(
  state = initialBluetoothState,
  action: fromActions.BluetoothActions
): BluetoothState {
  switch (action.type) {
    case fromActions.BluetoothActionTypes.InitializeBluetoothState:
      return {
        ...state,
        isNativePlatform: action.payload.isNativePlatform,
        isVirtualDevice: action.payload.isVirtualDevice,
        useMockDevice: action.payload.useMockDevice,
        deviceInfo: {
          ...state.deviceInfo,
          ...action.payload.deviceInfo,
        },
      };

    case fromActions.BluetoothActionTypes.Connect:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case fromActions.BluetoothActionTypes.ConnectionInProgress:
      return {
        ...state,
        connectionInProgress: true,
      };

    case fromActions.BluetoothActionTypes.SetConnectionInProgress:
      return {
        ...state,
        connectionInProgress: action.payload,
      };

    case fromActions.BluetoothActionTypes.ConnectSuccess:
      return {
        ...state,
        isConnected: true,
        connectionInProgress: false,
        loading: false,
        error: null,
        deviceInfo: {
          ...state.deviceInfo,
          ...action.payload.deviceInfo,
        },
      };

    case fromActions.BluetoothActionTypes.ConnectFailure:
      return {
        ...state,
        isConnected: false,
        connectionInProgress: false,
        loading: false,
        error: action.payload,
      };

    case fromActions.BluetoothActionTypes.Disconnect:
      return {
        ...state,
        loading: true,
      };

    case fromActions.BluetoothActionTypes.DisconnectSuccess:
      return {
        ...state,
        isConnected: false,
        loading: false,
      };

    case fromActions.BluetoothActionTypes.DisconnectFailure:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case fromActions.BluetoothActionTypes.StartScan:
      return {
        ...state,
        isScanning: true,
        devices: [],
        error: null,
      };

    case fromActions.BluetoothActionTypes.StopScan:
      return {
        ...state,
        isScanning: false,
      };

    case fromActions.BluetoothActionTypes.DeviceFound:
      // Check if device already exists to avoid duplicates
      const deviceExists = state.devices.some(
        (device) => device.device.deviceId === action.payload.device.deviceId
      );

      if (deviceExists) {
        return state;
      }

      return {
        ...state,
        devices: [...state.devices, action.payload],
      };

    case fromActions.BluetoothActionTypes.UpdateDeviceState:
      const stateName = getStateName(action.payload);
      return {
        ...state,
        state: action.payload,
        stateRaw: (action.payload << 8) | state.stateData,
        stateName,
        isConnected: action.payload !== DeviceStateCode.PoweringOff,
      };

    case fromActions.BluetoothActionTypes.UpdateDeviceStateData:
      return {
        ...state,
        stateData: action.payload,
        stateRaw: (state.state << 8) | action.payload,
      };

    case fromActions.BluetoothActionTypes.UpdateBatteryLevel:
      return {
        ...state,
        battery: action.payload,
      };

    case fromActions.BluetoothActionTypes.UpdateDeviceInfo:
      return {
        ...state,
        deviceInfo: {
          ...state.deviceInfo,
          ...action.payload,
        },
      };

    case fromActions.BluetoothActionTypes.PermissionsResult:
      return {
        ...state,
        permissionsStatus: action.payload,
      };

    case fromActions.BluetoothActionTypes.SetError:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case fromActions.BluetoothActionTypes.StartMockScenario:
      return {
        ...state,
        mockScenariosHistory: [...state.mockScenariosHistory, action.payload],
      };

    case fromActions.BluetoothActionTypes.StopMockScenario:
      return state;

    case fromActions.BluetoothActionTypes.CreateMockScenario:
      return state;

    case fromActions.BluetoothActionTypes.MockScenarioStepExecuted:
      return {
        ...state,
        state: action.payload.state,
      };

    case fromActions.BluetoothActionTypes.IncrementSuccessfulDoses:
      return {
        ...state,
        successfulDoses: state.successfulDoses + 1,
      };

    default:
      return state;
  }
}

function getStateName(stateCode: DeviceStateCode): string {
  return STATUS_NAMES[stateCode] || 'Unknown';
}

export const getBluetoothState =
  createFeatureSelector<BluetoothState>('bluetooth');

export const getIsConnected = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.isConnected
);

export const getIsScanning = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.isScanning
);

export const getDeviceInfo = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.deviceInfo
);

export const getDeviceState = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.state
);

export const getDeviceStateName = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.stateName
);

export const getDeviceStateData = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.stateData
);

export const getDeviceStateRaw = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.stateRaw
);

export const getBatteryLevel = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.battery
);

export const getDevices = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.devices
);

export const getError = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.error
);

export const getLoading = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.loading
);

export const getUseMockDevice = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.useMockDevice
);

export const getPermissionsStatus = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.permissionsStatus
);

export const getIsNativePlatform = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.isNativePlatform
);

export const getIsVirtualDevice = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.isVirtualDevice
);

export const getConnectionInProgress = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.connectionInProgress
);

export const getMockScenariosHistory = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.mockScenariosHistory
);

export const getSuccessfulDoses = createSelector(
  getBluetoothState,
  (state: BluetoothState) => state.successfulDoses
);
