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

export enum DeviceStateCode {
  Undefined = 0x00,
  PoweringOn = 0x01,
  PoweringOff = 0x02,
  Charging = 0x10,
  ChargingComplete = 0x11,
  DeviceError = 0x20,
  EndOfLife = 0x21,
  BatteryLow = 0x22,
  InsertCassette = 0x80,
  PreparingCassette = 0x81,
  RemoveNeedleCap = 0x82,
  ReadyForInjection = 0x83,
  Injecting = 0x84,
  DwellTime = 0x85,
  LiftFromInjectionSite = 0x86,
  ReleasingCassette = 0x87,
  RemoveCassette = 0x88,
  WarningInjectionIncomplete = 0xa0,
  WarningCassette = 0xb0,
  WarningCassetteUsed = 0xb1,
  WarningCassetteExpired = 0xb2,
  WarningCassetteUnknown = 0xb3,
}

export const STATUS_NAMES: Record<DeviceStateCode, string> = {
  [DeviceStateCode.Undefined]: 'Undefined',
  [DeviceStateCode.PoweringOn]: 'PoweringOn',
  [DeviceStateCode.PoweringOff]: 'PoweringOff',
  [DeviceStateCode.Charging]: 'Charging',
  [DeviceStateCode.ChargingComplete]: 'ChargingComplete',
  [DeviceStateCode.DeviceError]: 'DeviceError',
  [DeviceStateCode.EndOfLife]: 'EndOfLife',
  [DeviceStateCode.BatteryLow]: 'BatteryLow',
  [DeviceStateCode.InsertCassette]: 'InsertCassette',
  [DeviceStateCode.PreparingCassette]: 'PreparingCassette',
  [DeviceStateCode.RemoveNeedleCap]: 'RemoveNeedleCap',
  [DeviceStateCode.ReadyForInjection]: 'ReadyForInjection',
  [DeviceStateCode.Injecting]: 'Injecting',
  [DeviceStateCode.DwellTime]: 'DwellTime',
  [DeviceStateCode.LiftFromInjectionSite]: 'LiftFromInjectionSite',
  [DeviceStateCode.ReleasingCassette]: 'ReleasingCassette',
  [DeviceStateCode.RemoveCassette]: 'RemoveCassette',
  [DeviceStateCode.WarningInjectionIncomplete]: 'WarningInjectionIncomplete',
  [DeviceStateCode.WarningCassette]: 'WarningCassette',
  [DeviceStateCode.WarningCassetteUsed]: 'WarningCassetteUsed',
  [DeviceStateCode.WarningCassetteExpired]: 'WarningCassetteExpired',
  [DeviceStateCode.WarningCassetteUnknown]: 'WarningCassetteUnknown',
};

export const ARIA_ADVERTISING_NAME = 'Aria NIS';
export const ARIA_RSSI_THRESHOLD = -60;
export const SCAN_TIMEOUT_MS = 5000;
export const CONNECTION_TIMEOUT_MS = 30000;
