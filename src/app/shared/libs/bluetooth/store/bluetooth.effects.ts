import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import * as fromCoreStore from '@core/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageService } from '@shared/services/storage.service';
import { from, of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { DeviceStateCode } from '../constants/bluetooth.constants';
import { BluetoothMockManagerService } from '../services/bluetooth-mock-manager.service';
import { BluetoothService } from '../services/bluetooth.service';
import * as fromActions from './bluetooth.actions';
import * as fromSelector from './bluetooth.reducer';
import { BluetoothState } from './bluetooth.store';

@Injectable()
export class BluetoothEffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ bluetooth: BluetoothState }>,
    private bluetoothService: BluetoothService,
    private mockManager: BluetoothMockManagerService,
    private storageService: StorageService
  ) {}

  // Initialize platform detection and device info
  initializePlatform$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/effects/init'),
      switchMap(async () => {
        const isNativePlatform = Capacitor.isNativePlatform();
        let isVirtualDevice = false;

        // If we're on a native platform, check if it's a virtual device
        if (isNativePlatform) {
          try {
            const mobileDeviceInfo = await Device.getInfo();
            isVirtualDevice = mobileDeviceInfo.isVirtual;
          } catch (error) {
            console.error('Error getting device info:', error);
          }
        }
        // try to get save device info
        const savedState = this.storageService.getStoredState();
        const savedDeviceInfo = savedState?.bluetooth?.deviceInfo;
        const useMockDevice = !isNativePlatform || isVirtualDevice;
        const deviceInfo = savedDeviceInfo.serial
          ? savedDeviceInfo
          : {
              name: useMockDevice ? 'Mock Device' : '',
              manufacturer: '',
              model: '',
              serial: '',
              softwareRevision: '',
              hardwareRevision: '',
              rssi: 0,
            };

        return new fromActions.InitializeBluetoothState({
          isNativePlatform,
          isVirtualDevice,
          useMockDevice,
          deviceInfo,
        });
      })
    )
  );

  checkPermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.BluetoothActionTypes.CheckPermissions),
      switchMap(() =>
        from(this.bluetoothService.checkPermissions()).pipe(
          map((result) => new fromActions.PermissionsResult(result)),
          catchError((error) => of(new fromActions.SetError(error)))
        )
      )
    )
  );

  openSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.OpenSettings),
        tap(() => {
          this.bluetoothService.openSettingsApp();
        })
      ),
    { dispatch: false }
  );

  startScan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.BluetoothActionTypes.StartScan),
      withLatestFrom(this.store.select(fromSelector.getIsConnected)),
      switchMap(
        ([{ payload }, isConnected]: [fromActions.StartScan, boolean]) => {
          const silent = !!payload?.silent;

          if (isConnected) {
            return of(new fromActions.StopScan());
          }

          return from(this.bluetoothService.scan({ silent })).pipe(
            map(() => new fromActions.StopScan()),
            catchError((error) => of(new fromActions.SetError(error)))
          );
        }
      )
    )
  );

  stopScan$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.StopScan),
        tap(() => this.bluetoothService.stopScan())
      ),
    { dispatch: false }
  );

  connect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.BluetoothActionTypes.Connect),
      withLatestFrom(
        this.store.select(fromSelector.getIsConnected),
        this.store.select(fromSelector.getConnectionInProgress)
      ),
      switchMap(
        ([action, isConnected, connectionInProgress]: [
          fromActions.Connect,
          boolean,
          boolean
        ]) => {
          console.log(
            'Connect effect handling action, isConnected:',
            isConnected,
            'connectionInProgress:',
            connectionInProgress
          );

          if (isConnected) {
            console.log('Already connected, returning device info');
            const deviceInfo = {
              manufacturer: this.bluetoothService.Manufacturer,
              model: this.bluetoothService.Model,
              serial: this.bluetoothService.Serial,
              softwareRevision: this.bluetoothService.SoftwareRevision,
              hardwareRevision: this.bluetoothService.HardwareRevision,
              name: this.bluetoothService.Name,
              rssi: this.bluetoothService.RSSI,
            };
            return of(new fromActions.ConnectSuccess({ deviceInfo }));
          }

          if (connectionInProgress) {
            console.log(
              'Connection already in progress, not starting another one'
            );
            return of(new fromActions.ConnectionInProgress());
          }

          this.store.dispatch(new fromActions.SetConnectionInProgress(true));

          return from(this.bluetoothService.isDeviceConnected()).pipe(
            map((connected) => {
              this.store.dispatch(
                new fromActions.SetConnectionInProgress(false)
              );

              if (connected) {
                const deviceInfo = {
                  manufacturer: this.bluetoothService.Manufacturer,
                  model: this.bluetoothService.Model,
                  serial: this.bluetoothService.Serial,
                  softwareRevision: this.bluetoothService.SoftwareRevision,
                  hardwareRevision: this.bluetoothService.HardwareRevision,
                  name: this.bluetoothService.Name,
                  rssi: this.bluetoothService.RSSI,
                };

                return new fromActions.ConnectSuccess({ deviceInfo });
              } else {
                return new fromActions.ConnectFailure(
                  'Failed to connect to device'
                );
              }
            }),
            catchError((error) => {
              this.store.dispatch(
                new fromActions.SetConnectionInProgress(false)
              );
              return of(new fromActions.ConnectFailure(error));
            })
          );
        }
      )
    )
  );

  disconnect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.BluetoothActionTypes.Disconnect),
      switchMap(() =>
        from(this.bluetoothService.stop()).pipe(
          map(() => new fromActions.DisconnectSuccess()),
          catchError((error) => of(new fromActions.DisconnectFailure(error)))
        )
      )
    )
  );

  listenForDeviceState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.BluetoothActionTypes.ConnectSuccess),
      withLatestFrom(this.store.select(fromSelector.getUseMockDevice)),
      switchMap(([_, useMockDevice]: [fromActions.ConnectSuccess, boolean]) => {
        if (useMockDevice) {
          return of(
            new fromActions.MockDeviceState(DeviceStateCode.InsertCassette)
          );
        }
        return this.bluetoothService.state$.pipe(
          map((state) => new fromActions.UpdateDeviceState(state)),
          catchError((error) => of(new fromActions.SetError(error)))
        );
      })
    )
  );

  listenForDeviceStateData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.BluetoothActionTypes.ConnectSuccess),
      switchMap(() =>
        this.bluetoothService.stateData$.pipe(
          map((stateData) => new fromActions.UpdateDeviceStateData(stateData)),
          catchError((error) => of(new fromActions.SetError(error)))
        )
      )
    )
  );

  updateBatteryInCoreStore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.UpdateBatteryLevel),
        tap((action: fromActions.UpdateBatteryLevel) => {
          this.store.dispatch(
            new fromCoreStore.SetDosageDeviceInfo({
              battery: action.payload,
            })
          );
        })
      ),
    { dispatch: false }
  );

  updateConnectionInCoreStore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          fromActions.BluetoothActionTypes.ConnectSuccess,
          fromActions.BluetoothActionTypes.ConnectFailure,
          fromActions.BluetoothActionTypes.DisconnectSuccess
        ),
        tap((action: any) => {
          const isConnected =
            action.type === fromActions.BluetoothActionTypes.ConnectSuccess;
          this.store.dispatch(
            new fromCoreStore.SetDosageDeviceInfo({
              isConnected,
            })
          );
        })
      ),
    { dispatch: false }
  );

  updateDeviceStateInCoreStore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.UpdateDeviceState),
        tap((action: fromActions.UpdateDeviceState) => {
          this.store.dispatch(
            new fromCoreStore.SetDosageDeviceInfo({
              state: action.payload,
            })
          );
        })
      ),
    { dispatch: false }
  );

  updateDeviceStateDataInCoreStore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.UpdateDeviceStateData),
        tap((action: fromActions.UpdateDeviceStateData) => {
          this.store.dispatch(
            new fromCoreStore.SetDosageDeviceInfo({
              state_data: action.payload,
            })
          );
        })
      ),
    { dispatch: false }
  );

  mockDeviceState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.BluetoothActionTypes.MockDeviceState),
      withLatestFrom(this.store.select(fromSelector.getUseMockDevice)),
      switchMap(
        ([action, useMockDevice]: [fromActions.MockDeviceState, boolean]) => {
          if (useMockDevice) {
            return of(new fromActions.UpdateDeviceState(action.payload));
          }
          return of();
        }
      )
    )
  );

  startMockScenario$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.StartMockScenario),
        withLatestFrom(this.store.select(fromSelector.getUseMockDevice)),
        tap(
          ([action, useMockDevice]: [
            fromActions.StartMockScenario,
            boolean
          ]) => {
            if (useMockDevice) {
              this.mockManager.startScenario(action.payload);
            } else {
              console.error(
                'Cannot start mock scenario: Mock device is not enabled'
              );
            }
          }
        )
      ),
    { dispatch: false }
  );

  stopMockScenario$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.StopMockScenario),
        withLatestFrom(this.store.select(fromSelector.getUseMockDevice)),
        tap(([_, useMockDevice]: [fromActions.StopMockScenario, boolean]) => {
          if (useMockDevice) {
            this.mockManager.stopScenario();
          } else {
            console.error(
              'Cannot stop mock scenario: Mock device is not enabled'
            );
          }
        })
      ),
    { dispatch: false }
  );

  createMockScenario$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromActions.BluetoothActionTypes.CreateMockScenario),
        withLatestFrom(this.store.select(fromSelector.getUseMockDevice)),
        tap(
          ([action, useMockDevice]: [
            fromActions.CreateMockScenario,
            boolean
          ]) => {
            if (useMockDevice) {
              this.mockManager.createScenario(action.payload);
            } else {
              console.error(
                'Cannot create mock scenario: Mock device is not enabled'
              );
            }
          }
        )
      ),
    { dispatch: false }
  );
}
