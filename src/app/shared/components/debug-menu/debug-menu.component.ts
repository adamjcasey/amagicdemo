import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
} from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import * as fromBluetoothStore from '@shared/libs/bluetooth/store';
import {
  getBluetoothState,
  getUseMockDevice,
} from '@shared/libs/bluetooth/store/bluetooth.reducer';
import * as fromSharedStore from '@shared/store';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';
import { Observable, Subject } from 'rxjs';
import { LogEntry, LogViewerService } from '../../services/log-viewer.service';

@Component({
  selector: 'automagic-debug-menu',
  templateUrl: './debug-menu.component.html',
  styleUrls: ['./debug-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
  ],
})
export class DebugMenuComponent implements OnDestroy {
  #store = inject(Store);
  #logViewerService = inject(LogViewerService);
  destroy$ = new Subject<void>();

  logs$: Observable<LogEntry[]> = this.#logViewerService.logs$;
  useMockDevice$ = this.#store.select(getUseMockDevice);
  bluetoothState$ = this.#store.select(getBluetoothState);

  constructor() {
    addIcons({
      closeOutline,
      trashOutline,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeOverlay(): void {
    this.#store.dispatch(new fromSharedStore.OverlayHide());
  }

  clearLogs(): void {
    this.#logViewerService.clearLogs();
  }

  toggleMockDevice(event: any): void {
    this.#store.dispatch(
      new fromBluetoothStore.InitializeBluetoothState({
        isNativePlatform: false,
        isVirtualDevice: true,
        useMockDevice: event.detail.checked,
        deviceInfo: {
          name: 'Mock Device',
          manufacturer: '',
          model: '',
          serial: '',
          softwareRevision: '',
          hardwareRevision: '',
          rssi: 0,
        },
      })
    );
  }

  formatDate(date: Date): string {
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

    return `${formattedDate}.${milliseconds}`;
  }

  formatPayload(payload: any): string {
    if (payload === undefined) return '';
    try {
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      return '[Non-serializable payload]';
    }
  }
}
