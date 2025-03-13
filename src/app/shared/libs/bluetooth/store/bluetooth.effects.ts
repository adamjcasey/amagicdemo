import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import * as fromCoreStore from '@core/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { BluetoothService } from '../services/bluetooth.service';
import * as fromActions from './bluetooth.actions';
import * as fromSelector from './bluetooth.reducer';
import { BluetoothState } from './bluetooth.store';

@Injectable()
export class BluetoothEffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ bluetooth: BluetoothState }>,
    private bluetoothService: BluetoothService
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
            const deviceInfo = await Device.getInfo();
            isVirtualDevice = deviceInfo.isVirtual;
          } catch (error) {
            console.error('Error getting device info:', error);
          }
        }

        const useMockDevice = !isNativePlatform || isVirtualDevice;

        return new fromActions.InitializeBluetoothState({
          isNativePlatform,
          isVirtualDevice,
          useMockDevice,
          deviceInfo: {
            name: useMockDevice ? 'Mock Device' : '',
            manufacturer: '',
            model: '',
            serial: '',
            softwareRevision: '',
            hardwareRevision: '',
            rssi: 0,
          },
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
      switchMap(([_, isConnected]) => {
        if (isConnected) {
          return of(new fromActions.StopScan());
        }

        return from(this.bluetoothService.scan()).pipe(
          map(() => new fromActions.StopScan()),
          catchError((error) => of(new fromActions.SetError(error)))
        );
      })
    )
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
      switchMap(() =>
        this.bluetoothService.state$.pipe(
          map((state) => new fromActions.UpdateDeviceState(state)),
          catchError((error) => of(new fromActions.SetError(error)))
        )
      )
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
}
