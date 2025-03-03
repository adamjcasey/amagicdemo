export const SERVICE_ARIA_DEVICE_INFORMATION =
  '0000180A-0000-1000-8000-00805F9B34FB';
export const CHARACTERISTIC_MFR_NAME_STRING = 0x2a29;
export const CHARACTERISTIC_MODEL_NUMBER_STRING = 0x2a24;
export const CHARACTERISTIC_SERIAL_NUMBER_STRING = 0x2a25;
export const CHARACTERISTIC_SOFTWARE_REVISION_STRING = 0x2a28;
export const CHARACTERISTIC_HARDWARE_REVISION_STRING = 0x2a27;

export const SERVICE_ARIA_BATTERY = '0000180F-0000-1000-8000-00805F9B34FB';
export const CHARACTERISTIC_BATTERY_LEVEL = 0x2a19;

export const SERVICE_ARIA_DEVICE_STATUS =
  'CCFD0000-E3D9-49A4-A69E-246C9560FFDE';
export const CHARACTERISTIC_DEVICE_STATE =
  'CCFD4010-E3D9-49A4-A69E-246C9560FFDE';

export const STATUS_NAMES: { [key: number]: string } = {
  0x00: 'Undefined',
  0x01: 'PoweringOn',
  0x02: 'PoweringOff',
  0x10: 'Charging',
  0x11: 'ChargingComplete',
  0x20: 'DeviceError',
  0x21: 'EndOfLife',
  0x22: 'BatteryLow',
  0x80: 'InsertCassette',
  0x81: 'PreparingCassette',
  0x82: 'RemoveNeedleCap',
  0x83: 'ReadyForInjection',
  0x84: 'Injecting',
  0x85: 'DwellTime',
  0x86: 'LiftFromInjectionSite',
  0x87: 'ReleasingCassette',
  0x88: 'RemoveCassette',
  0xa0: 'WarningInjectionIncomplete',
  0xa1: 'WarningCassette',
};

export const ARIA_ADVERTISING_NAME = 'Aria NIS';
export const ARIA_RSSI_THRESHOLD = -60;
export const SCAN_TIMEOUT_MS = 5000;
export const CONNECTION_TIMEOUT_MS = 30000;
