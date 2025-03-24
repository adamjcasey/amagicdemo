import { Directive, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Directive()
export abstract class DeviceConnectionAbstract implements OnDestroy {
  protected store = inject(Store<fromCoreStore.CoreState>);

  protected isDeviceConnected$: Observable<boolean> = this.store.select(
    fromBluetoothStore.getIsConnected
  );

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  protected initDeviceConnectionMonitoring(): void {
    this.isDeviceConnected$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isConnected) => {
        if (!isConnected) {
          this.showConnectDeviceOverlay();
        }
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
