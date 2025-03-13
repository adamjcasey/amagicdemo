import { createSelector } from '@ngrx/store';
import { DeviceStateCode } from '../constants/bluetooth.constants';
import { getDeviceState } from './bluetooth.reducer';

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
