import { Directive, OnDestroy } from '@angular/core';
import { Observable, takeUntil } from 'rxjs';

import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import { SCAN_TIMEOUT_MS } from '@shared/libs/bluetooth';
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
          if (this.isAlertShown) {
            console.log('DeviceConnectionAbstract: Closing alert');
            this.closeAlertWhenConnected();
          }
        }
      });
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

  override ngOnDestroy() {
    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
      this.#reconnectTimeout = null;
    }
    this.#reconnectInProgress = false;
    super.ngOnDestroy();
  }
}
