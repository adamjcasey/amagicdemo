import { Directive, OnDestroy } from '@angular/core';
import { combineLatest, Observable, takeUntil } from 'rxjs';

import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import { DeviceStateCode, SCAN_TIMEOUT_MS } from '@shared/libs/bluetooth';
import * as fromSharedStore from '@shared/store';
import { take, tap } from 'rxjs/operators';
import { BaseComponentAbstract } from './base-component.abstract';

@Directive()
export abstract class DeviceConnectionAbstract
  extends BaseComponentAbstract
  implements OnDestroy
{
  waitForDeviceConnection = false;
  isAlertShown = false;
  #reconnectInProgress = false;
  #reconnectTimeout: any = null;
  protected readonly silentReconnectTimeout = SCAN_TIMEOUT_MS;

  protected isDeviceConnected$: Observable<boolean> = this.store.select(
    fromBluetoothStore.getIsConnected
  );

  protected deviceState$: Observable<number> = this.store.select(
    fromBluetoothStore.getDeviceState
  );

  protected constructor(
    options: { waitForDeviceConnection: boolean } = {
      waitForDeviceConnection: false,
    }
  ) {
    super();
    this.waitForDeviceConnection = options.waitForDeviceConnection;

    console.log(
      'DeviceConnectionAbstract: Initializing with waitForDeviceConnection:',
      this.waitForDeviceConnection
    );

    this.isDeviceConnected$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((isConnected) => {
          console.log('DeviceConnectionAbstract: Connection state changed:', {
            isConnected,
            reconnectInProgress: this.#reconnectInProgress,
            waitForDeviceConnection: this.waitForDeviceConnection,
            isAlertShown: this.isAlertShown,
          });
        })
      )
      .subscribe((isConnected) => {
        if (this.#reconnectTimeout) {
          console.log(
            'DeviceConnectionAbstract: Clearing previous reconnect timeout'
          );
          clearTimeout(this.#reconnectTimeout);
          this.#reconnectTimeout = null;
        }

        if (!isConnected && !this.waitForDeviceConnection) {
          console.log(
            'DeviceConnectionAbstract: Device disconnected, starting reconnect process'
          );
          this.#reconnectInProgress = true;
          this.silentReconnect();

          this.#reconnectTimeout = setTimeout(() => {
            console.log('DeviceConnectionAbstract: Reconnect timeout reached');
            if (!isConnected && !this.waitForDeviceConnection) {
              console.log(
                'DeviceConnectionAbstract: Showing alert after timeout'
              );
              this.showDeviceDisconnectedAlert();
            }
            this.#reconnectInProgress = false;
            this.#reconnectTimeout = null;
          }, this.silentReconnectTimeout);
        } else if (isConnected) {
          if (this.waitForDeviceConnection) {
            console.log(
              'DeviceConnectionAbstract: Device connected, setting waitForDeviceConnection to false'
            );
            this.waitForDeviceConnection = false;
          }

          this.#reconnectInProgress = false;
          // TODO: Test if this is needed
          if (this.isAlertShown) {
            console.log('DeviceConnectionAbstract: Closing alert');
            this.closeAlertWhenConnected();
          }
        }
      });

    combineLatest([this.deviceState$, this.isDeviceConnected$])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([deviceState, isConnected]) => {
        console.log(
          'DeviceConnectionAbstract: Device state and connection changed:',
          { isConnected, deviceState }
        );
        if (
          isConnected &&
          (this.isDeviceInErrorState(deviceState) ||
            this.isCassetteInErrorState(deviceState) ||
            this.isDeviceInRemoveCassetteState(deviceState))
        ) {
          console.log(
            'DeviceConnectionAbstract: Device in error state and connected, stopping reconnect process'
          );
          if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
            this.#reconnectTimeout = null;
          }
          this.#reconnectInProgress = false;

          if (this.isCassetteInErrorState(deviceState)) {
            console.log(
              'DeviceConnectionAbstract: Device in cassette error state and connected, showing alert'
            );
            this.handleCassetteWarning(deviceState);
          } else if (this.isDeviceInErrorState(deviceState)) {
            console.log(
              'DeviceConnectionAbstract: Device in error state and connected, showing alert'
            );
            this.showInjectorErrorAlert();
          } else if (this.isDeviceInRemoveCassetteState(deviceState)) {
            console.log(
              'DeviceConnectionAbstract: Device in release cassette state and connected, showing alert'
            );
            this.goTo('/home/cassette-remove');
          }
        }
      });
  }

  protected isDeviceInErrorState(deviceState: number): boolean {
    return (
      // Device probably can't even be in undefined state, commenting this out for now as it breaks the app's behavior
      // deviceState === DeviceStateCode.Undefined ||
      deviceState === DeviceStateCode.DeviceError ||
      deviceState === DeviceStateCode.EndOfLife ||
      deviceState === DeviceStateCode.DeviceErrorSelftest
    );
  }

  protected isCassetteInErrorState(deviceState: number): boolean {
    return (
      deviceState === DeviceStateCode.WarningCassette ||
      deviceState === DeviceStateCode.WarningCassetteUsed ||
      deviceState === DeviceStateCode.WarningCassetteExpired ||
      deviceState === DeviceStateCode.WarningCassetteUnknown
    );
  }

  protected isDeviceInRemoveCassetteState(deviceState: number): boolean {
    return deviceState === DeviceStateCode.RemoveCassette;
  }

  protected silentReconnect() {
    console.log('DeviceConnectionAbstract: Executing silent reconnect');
    this.store.dispatch(new fromBluetoothStore.StartScan({ silent: true }));
  }

  protected closeAlertWhenConnected() {
    this.isAlertShown = false;
    this.store.dispatch(new fromSharedStore.AlertHide());
  }

  protected handleCassetteWarning(deviceState: number) {
    if (deviceState === DeviceStateCode.WarningCassetteExpired) {
      this.showCassetteExpiredAlert();
    } else {
      this.showCassetteLoadingAlert();
    }
  }

  protected showConnectDeviceOverlay(): void {
    this.store.dispatch(
      new fromSharedStore.OverlayShow({
        component: 'ConnectDeviceComponent',
        closeOnOverlayClick: false,
      })
    );
  }

  protected showDeviceDisconnectedAlert(): void {
    this.store.dispatch(new fromBluetoothStore.StopScan());

    this.isAlertShown = true;
    this.store.dispatch(
      new fromSharedStore.AlertShow({
        mode: 'full',
        template: `
          <img src="/assets/images/device-connection-warning.svg" />
          <h1 class="font-heading-1--bold">Aria Disconnected</h1>
          <p>The connection to the Aria Autoinjector is broken.</p>
          <p><b>Please re-connect the device.</b></p>
        `,
        actions: [
          {
            label: 'Reconnect',
            fill: 'outline',
            action: () => {
              this.isAlertShown = false;
              this.showConnectDeviceOverlay();
              this.store.dispatch(new fromSharedStore.AlertHide());
            },
          },
        ],
      })
    );
  }

  // Similar alert will be shown for Drug expired and Error message
  protected showInjectorErrorAlert(): void {
    this.store.dispatch(new fromBluetoothStore.StopScan());

    this.isAlertShown = true;
    this.store.dispatch(
      new fromSharedStore.AlertShow({
        mode: 'window',
        overlay: true,
        margin: true,
        template: `
            <img src="/assets/images/device-connection-warning.svg" style="margin: 0 auto; width: 100px;" />
            <h3 class="font-heading-1--semibold">Injector Error</h3>
            <p>There seems to be an issue with the injector and it is unsafe to use. We are sorry!</p>
            <p><b>Please contact your Pharmacy for a new dose.</b></p>
        `,
        actions: [
          {
            label: 'OK',
            fill: 'outline',
            action: () => {
              this.isAlertShown = false;
              this.handleInjectorError();
              this.store.dispatch(new fromSharedStore.AlertHide());
            },
          },
          {
            label: 'My Pharmacy',
            fill: 'outline',
            action: () => {
              // do nothing
            },
          },
        ],
      })
    );
  }

  protected showCassetteLoadingAlert(): void {
    this.deviceState$.pipe(take(1)).subscribe((deviceState) => {
      let title = 'Cassette Loading Error';
      let message = 'The cassette may be defective or was not loaded properly.';

      if (deviceState === DeviceStateCode.WarningCassetteUsed) {
        title = 'Cassette has been used';
        message = 'The cassette has already been used and cannot be re-used.';
      } else if (deviceState === DeviceStateCode.WarningCassetteUnknown) {
        title = 'Cassette is not known';
        message =
          'The cassette cannot be verified and may be from an unknown source.';
      }

      this.store.dispatch(
        new fromSharedStore.AlertShow({
          mode: 'full',
          template: `
      <img src="assets/images/cassette-expired.svg" />
      <h1 class="font-heading-1--bold">${title}</h1>
      <p>${message}</p>
      <p><b>Please check the cassette and reload a different cassette if problem persists.<b></p>
    `,
          actions: [
            {
              label: 'Reload cassette',
              fill: 'outline',
              action: () => {
                this.store.dispatch(new fromSharedStore.AlertHide());
                this.goToRemoveCassette();
              },
            },
          ],
        })
      );
    });
  }

  protected showCassetteExpiredAlert() {
    this.store.dispatch(
      new fromSharedStore.AlertShow({
        mode: 'full',
        template: `
      <img src="assets/images/cassette-expired.svg" />
      <h1 class="font-heading-1--bold">Drug expired</h1>
      <p>The dose has expired and is not safe to use.</p>
      <p><b>Please remove the cassette and replace with unexpired cassette and contact your Pharmacy for a new dose.</b></p>
    `,
        actions: [
          {
            label: 'Ok',
            fill: 'outline',
            action: () => {
              this.store.dispatch(new fromSharedStore.AlertHide());
              this.goToRemoveCassette();
            },
          },
          {
            label: 'My Pharmacy',
            fill: 'outline',
            action: () => {
              this.store.dispatch(new fromSharedStore.AlertHide());
              this.goToRemoveCassette();
            },
          },
        ],
      })
    );
  }

  protected handleInjectorError(): void {
    console.log('DeviceConnectionAbstract: Handling injector error');

    this.store.dispatch(new fromBluetoothStore.Disconnect());
    this.goTo('/home/cassette-journey');
  }

  protected goToRemoveCassette(): void {
    this.goTo('/home/cassette-remove');
  }

  override ngOnDestroy() {
    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
      this.#reconnectTimeout = null;
    }
    this.#reconnectInProgress = false;
    super.ngOnDestroy();
  }
}
