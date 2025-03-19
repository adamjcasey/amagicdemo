import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { getIsConnected } from '@shared/libs/bluetooth/store';
import * as fromSharedStore from '../../../store/shared.actions';
import * as fromCoreStore from '@core/store';

@Injectable({
  providedIn: 'root',
})
export class DeviceConnectionService {
  #store = inject(Store<fromCoreStore.LayoutState>);
  #isConnected$: Observable<boolean> = this.#store.select(getIsConnected);

  #isAlreadyConnected = false;
  #isConnectedSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.monitorConnection();
  }

  monitorConnection(): void {
    this.#isConnected$.subscribe((isConnected) => {
      if (this.#isAlreadyConnected && !isConnected) {
        this.#showDeviceDisconnectedAlert();
      }
      this.#isAlreadyConnected = isConnected;
      this.#isConnectedSubject.next(isConnected);
    });
  }

  #showDeviceDisconnectedAlert(): void {
    this.#store.dispatch(
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
              // TODO: Open connect device page
              this.#store.dispatch(new fromSharedStore.AlertHide());
            },
          },
        ],
      })
    );
  }

  #goTo(path: string) {
    this.#store.dispatch(new fromCoreStore.Go({ path: [path] }));
  }
}
