import { ScanResult } from '@capacitor-community/bluetooth-le';

export interface BluetoothState {
  // Connection state
  isConnected: boolean;
  isScanning: boolean;
  isSilentScan: boolean;
  connectionInProgress: boolean;

  // Device information
  deviceInfo: {
    manufacturer?: string;
    model?: string;
    serial?: string;
    softwareRevision?: string;
    hardwareRevision?: string;
    name?: string;
    rssi?: number;
  };

  // Device state
  state: number;
  stateData: number;
  stateRaw: number;
  stateName: string;
  battery: number;

  // Available devices from scanning
  devices: ScanResult[];

  // Configuration
  useMockDevice: boolean;
  isVirtualDevice: boolean;
  isNativePlatform: boolean;

  // Permissions
  permissionsStatus: 'unknown' | 'granted' | 'not-allowed';

  // Error handling
  error: any;
  loading: boolean;

  // Mock scenarios history
  mockScenariosHistory: string[];

  // Dosing counter
  successfulDoses: number;
}

export const initialBluetoothState: BluetoothState = {
  isConnected: false,
  isScanning: false,
  isSilentScan: false,
  connectionInProgress: false,

  deviceInfo: {},

  // state can't be 0 because it's used to check if the state is defined
  state: -1,
  stateData: 0,
  stateRaw: 0,
  stateName: 'Undefined',
  battery: 0,

  devices: [],

  useMockDevice: false,
  isVirtualDevice: false,
  isNativePlatform: false,

  permissionsStatus: 'unknown',

  error: null,
  loading: false,

  mockScenariosHistory: [],

  successfulDoses: 0,
};
