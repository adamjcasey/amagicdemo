import { Directive } from '@angular/core';
import { Observable, takeUntil } from 'rxjs';

import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import * as fromSharedStore from '@shared/store';
import { BaseComponentAbstract } from './base-component.abstract';

@Directive()
export abstract class DeviceConnectionAbstract extends BaseComponentAbstract {
  protected isAlreadyConnected = false;

  protected isDeviceConnected$: Observable<boolean> = this.store.select(
    fromBluetoothStore.getIsConnected
  );

  protected constructor() {
    super();
    this.isDeviceConnected$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isConnected) => {
        if (this.isAlreadyConnected && !isConnected) {
          this.showDeviceDisconnectedAlert();
        }
        this.isAlreadyConnected = isConnected;
      });
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
              this.showConnectDeviceOverlay();
              this.store.dispatch(new fromSharedStore.AlertHide());
            },
          },
        ],
      })
    );
  }
}
