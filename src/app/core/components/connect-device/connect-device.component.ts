import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as fromCoreStore from '@core/store';
import * as fromBluetoothStore from '@shared/libs/bluetooth/store';

export enum ConnectDeviceScreens {
  Initial = 0,
  Connecting = 1,
  Connected = 2,
}

@Component({
  selector: 'automagic-connect-device',
  templateUrl: './connect-device.component.html',
  styleUrls: ['./connect-device.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule],
})
export class ConnectDeviceComponent implements OnInit, OnDestroy {
  @Output() connectionComplete = new EventEmitter<void>();

  #store = inject(Store<fromCoreStore.CoreState>);
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  ConnectDeviceScreens = ConnectDeviceScreens;
  currentScreen = ConnectDeviceScreens.Initial;

  ngOnInit() {
    this.currentScreen = ConnectDeviceScreens.Initial;
    this.#store
      .select(fromBluetoothStore.getIsConnected)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isConnected) => {
        if (isConnected) {
          this.#store.dispatch(new fromBluetoothStore.StopScan());
          this.currentScreen = ConnectDeviceScreens.Connected;
        }
      });
  }

  startConnecting(): void {
    this.#store.dispatch(new fromBluetoothStore.StartScan());
    this.currentScreen = ConnectDeviceScreens.Connecting;
  }

  finishConnection(): void {
    this.connectionComplete.emit();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
