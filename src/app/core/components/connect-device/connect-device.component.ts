import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import * as fromCoreStore from '@core/store';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import * as fromBluetoothStore from '@shared/libs/bluetooth/store';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

export enum ConnectDeviceScreens {
  Initial = 0,
  BluetoothRequired = 1,
  Connecting = 2,
  Connected = 3,
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
  @Output() bluetoothPermissionDenied = new EventEmitter<void>();

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

  async startConnecting(): Promise<void> {
    try {
      this.#store.dispatch(new fromBluetoothStore.CheckPermissions());

      const permissionsStatus = await new Promise<'granted' | 'not-allowed'>(
        (resolve) => {
          this.#store
            .select(fromBluetoothStore.getPermissionsStatus)
            .pipe(
              filter((status) => status !== 'unknown'),
              take(1)
            )
            .subscribe((status) => {
              resolve(status as 'granted' | 'not-allowed');
            });
        }
      );

      if (permissionsStatus === 'granted') {
        this.#store.dispatch(new fromBluetoothStore.StartScan());
        this.currentScreen = ConnectDeviceScreens.Connecting;
      } else {
        this.currentScreen = ConnectDeviceScreens.BluetoothRequired;
        this.bluetoothPermissionDenied.emit();
      }
    } catch (error) {
      console.error('Error checking bluetooth permissions:', error);
      this.currentScreen = ConnectDeviceScreens.BluetoothRequired;
      this.bluetoothPermissionDenied.emit();
    }
  }

  openBluetoothSettings(): void {
    this.#store.dispatch(new fromBluetoothStore.OpenSettings());
  }

  finishConnection(): void {
    this.connectionComplete.emit();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
