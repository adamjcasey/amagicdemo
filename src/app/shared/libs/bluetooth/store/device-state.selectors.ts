import { createSelector } from '@ngrx/store';
import { getDeviceState } from './bluetooth.reducer';

// Device state codes from bluetooth.constants.ts
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
  WarningCassette = 0xa1,
}

export const isRemoveNeedleCapState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.RemoveNeedleCap
);

export const isReadyForInjectionState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.ReadyForInjection
);

export const isInjectingState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.Injecting
);

export const isDwellTimeState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.DwellTime
);

export const isLiftFromInjectionSiteState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.LiftFromInjectionSite
);

export const isReleasingCassetteState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.ReleasingCassette
);

export const isRemoveCassetteState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.RemoveCassette
);

export const isWarningInjectionIncompleteState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.WarningInjectionIncomplete
);

export const isWarningCassetteState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.WarningCassette
);

export const isCassetteInsertionRequiredState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.InsertCassette
);

export const isCassetteBeingPreparedState = createSelector(
  getDeviceState,
  (state: number) => state === DeviceStateCode.PreparingCassette
);

export const isCassetteVerifiedState = createSelector(
  getDeviceState,
  (state: number) =>
    state === DeviceStateCode.RemoveNeedleCap ||
    state === DeviceStateCode.ReadyForInjection ||
    state === DeviceStateCode.Injecting ||
    state === DeviceStateCode.DwellTime ||
    state === DeviceStateCode.LiftFromInjectionSite ||
    state === DeviceStateCode.ReleasingCassette ||
    state === DeviceStateCode.RemoveCassette
);
