/**
 * Type definitions and interfaces for Bluetooth functionality
 */

/**
 * Represents a Bluetooth scan result
 */
export interface ScanResult {
  device: any; // Replace with more specific type if available
  name?: string;
  rssi?: number;
  manufacturerData?: any;
  serviceData?: any;
  serviceUUIDs?: string[];
}

/**
 * Represents Bluetooth device information
 */
export interface DeviceInfo {
  name: string;
  id: string;
  rssi: number;
  manufacturer?: string;
  model?: string;
  serial?: string;
  hardwareRevision?: string;
  softwareRevision?: string;
  batteryLevel?: number;
}

/**
 * Represents the state of the Bluetooth connection
 */
export interface BluetoothState {
  connected: boolean;
  scanning: boolean;
  deviceState: number;
  stateData: number;
  battery: number;
}

/**
 * Represents a Bluetooth characteristic
 */
export interface BluetoothCharacteristic {
  service: string;
  characteristic: string;
  properties: string[];
}

/**
 * Represents options for Bluetooth operations
 */
export interface BluetoothOperationOptions {
  timeout?: number;
  retries?: number;
  onProgress?: (progress: number) => void;
}
