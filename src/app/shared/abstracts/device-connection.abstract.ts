import { Directive, OnDestroy } from '@angular/core';
import { combineLatest, Observable, takeUntil } from 'rxjs';

import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import { DeviceStateCode, SCAN_TIMEOUT_MS } from '@shared/libs/bluetooth';
import * as fromSharedStore from '@shared/store';
import { tap } from 'rxjs/operators';
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
        if (isConnected && this.isDeviceInErrorState(deviceState)) {
          console.log(
            'DeviceConnectionAbstract: Device in error state and connected, stopping reconnect process'
          );
          if (this.#reconnectTimeout) {
            clearTimeout(this.#reconnectTimeout);
            this.#reconnectTimeout = null;
          }
          this.#reconnectInProgress = false;

          console.log(
            'DeviceConnectionAbstract: Device in error state and connected, showing alert'
          );
          this.showInjectorErrorAlert();
        }
      });
  }

  protected isDeviceInErrorState(deviceState: number): boolean {
    return (
      deviceState === DeviceStateCode.Undefined ||
      deviceState === DeviceStateCode.DeviceError ||
      deviceState === DeviceStateCode.EndOfLife ||
      deviceState === DeviceStateCode.DeviceErrorSelftest
    );
  }

  protected silentReconnect() {
    console.log('DeviceConnectionAbstract: Executing silent reconnect');
    this.store.dispatch(new fromBluetoothStore.StartScan({ silent: true }));
  }

  protected closeAlertWhenConnected() {
    this.isAlertShown = false;
    this.store.dispatch(new fromSharedStore.AlertHide());
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

  protected handleInjectorError(): void {
    console.log('DeviceConnectionAbstract: Handling injector error');

    this.store.dispatch(new fromBluetoothStore.Disconnect());
    this.goTo('/home/cassette-journey');
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
