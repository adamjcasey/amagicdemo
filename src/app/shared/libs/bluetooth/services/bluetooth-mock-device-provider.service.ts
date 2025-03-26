import { Injectable, inject } from '@angular/core';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { Store } from '@ngrx/store';
import { DeviceStateCode } from '../constants/bluetooth.constants';
import * as fromBluetoothStore from '../store';

@Injectable({
  providedIn: 'root',
})
export class BluetoothMockDeviceProvider {
  #store = inject(Store);

  #mockDevices: ScanResult[] = [];
  #connected = false;

  #defaultDeviceInfo = {
    name: 'Aria Mock Device',
    manufacturer: 'Theryx',
    model: 'AutoMagic Demo',
    serial: 'MOCK123456',
    softwareRevision: '1.0.0',
    hardwareRevision: '2.0.0',
    rssi: -45,
    battery: 85,
  };

  resetConnectionState(): void {
    this.#connected = false;
    this.#mockDevices = [];
  }

  async provideMockDevice(provideMockDeviceTimeout = true): Promise<void> {
    console.log('Providing mock device');

    this.#connected = false;

    if (!this.#mockDevices.length) {
      const mockDevice = {
        device: {
          name: this.#defaultDeviceInfo.name,
          deviceId: 'mock-device-id',
        },
        rssi: this.#defaultDeviceInfo.rssi,
        advertisementData: {
          localName: 'Aria Mock',
          serviceUUIDs: ['MOCKED_UUID'],
        },
      };

      this.#mockDevices.push(mockDevice as unknown as ScanResult);
    }

    // Wait to simulate real scanning
    return new Promise((resolve) => {
      setTimeout(
        () => {
          if (!this.#connected) {
            this.connectToMockDevice(this.#mockDevices[0]).then(resolve);
          } else {
            resolve();
          }
        },
        provideMockDeviceTimeout ? 3000 : 0
      );
    });
  }

  async connectToMockDevice(mockDevice: ScanResult): Promise<void> {
    console.log('Connecting to mock device');

    try {
      this.#connected = true;

      this.#store.dispatch(
        new fromBluetoothStore.ConnectSuccess({
          deviceInfo: {
            manufacturer: this.#defaultDeviceInfo.manufacturer,
            model: this.#defaultDeviceInfo.model,
            serial: this.#defaultDeviceInfo.serial,
            softwareRevision: this.#defaultDeviceInfo.softwareRevision,
            hardwareRevision: this.#defaultDeviceInfo.hardwareRevision,
            name: this.#defaultDeviceInfo.name,
            rssi: this.#defaultDeviceInfo.rssi,
          },
        })
      );

      // Set initial state to InsertCassette
      this.#store.dispatch(
        new fromBluetoothStore.UpdateDeviceState(DeviceStateCode.InsertCassette)
      );
      this.#store.dispatch(new fromBluetoothStore.UpdateDeviceStateData(0));
      this.#store.dispatch(
        new fromBluetoothStore.UpdateBatteryLevel(
          this.#defaultDeviceInfo.battery
        )
      );

      console.log('Mock device connected successfully');
    } catch (error) {
      console.error('Error connecting to mock device', error);
    }

    return Promise.resolve();
  }

  async disconnectMockDevice(): Promise<void> {
    if (this.#connected) {
      this.resetConnectionState();
      this.#store.dispatch(new fromBluetoothStore.DisconnectSuccess());
      console.log('Mock device disconnected');
    }
    return Promise.resolve();
  }
}
