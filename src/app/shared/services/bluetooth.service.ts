import { Injectable, NgZone } from '@angular/core';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromCoreStore from '@core/store';

const AUTOMAGIC_SERVICE = 'EDFEC62E-9910-0BAC-5241-D8BDA6932A2F';
const AUTOMAGIC_STATE_CHARACTERISTIC = '5A87B4EF-3BFA-76A8-E642-92933C31434F';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {
  private uuid_: string;
  private rssi_: number;
  private name_: string;
  private state_: number;
  private battery_: number;
  private dosage_: number;
  private interval_id_: any;
  private peripheral_: any;
  private isConnected_: boolean;
  private isScanning_: boolean;

  // Variables for mocking
  private mock_state: number = 1;
  private mock_battery: number = 100;
  private mock_dosing: number = 0;

  public layoutConfig$: Observable<any>;
  public layoutConfig: any;

  constructor(
    private _store: Store<fromCoreStore.LayoutState>,
  ) {
    // Initialize your properties here, if needed.
    this.uuid_ = '';
    this.rssi_ = 0;
    this.name_ = '';
    this.state_ = 0;
    this.battery_ = 20;
    this.dosage_ = 0;
    this.isConnected_ = false;
    this.isScanning_ = false;

    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.layoutConfig$.subscribe(layoutConfig => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
      }
    });
  }

  //--------------------------------------------------
  // Properties
  //--------------------------------------------------

  // Getters
  get UUID(): string {
    return this.uuid_;
  }

  get Name(): string {
    return this.name_;
  }

  get RSSI(): number {
    return this.rssi_;
  }

  get State(): number {
    return this.state_;
  }

  get Battery(): number {
    return this.battery_;
  }

  get Dosage(): number {
    return this.dosage_;
  }

  get IsConnected(): boolean {
    return this.isConnected_;
  }

  // Setters
  set UUID(uuid: string) {
    this.uuid_ = uuid;
  }

  set Name(name: string) {
    this.name_ = name;
  }

  set RSSI(rssi: number) {
    this.rssi_ = rssi;
  }

  set State(state: number) {
    this.state_ = state;
  }

  set Battery(battery: number) {
    this.battery_ = battery;
  }

  set Dosage(dosage: number) {
    this.dosage_ = dosage;
  }

  set IsConnected(isConnected: boolean) {
    this.isConnected_ = isConnected;
  }

  //--------------------------------------------------
  // Bluetooth Actions
  //--------------------------------------------------
  async checkPermissions() {
    if (Capacitor.isNativePlatform() && !this.layoutConfig.noDeviceMode) {
      await BleClient.initialize();
      const isEnabled = await BleClient.isEnabled();
      return new Promise((resolve, reject) => {
        if (isEnabled) {
          resolve('granted');
        }
        else {
          reject('not-allowed');
        }
      });
    }
    else {
      return new Promise((resolve) => {
        resolve('granted');
      });
    }
  }

  async waitForDosingStart() {
    // start watching the press on the device
    if (Capacitor.isNativePlatform()  && !this.layoutConfig.noDeviceMode) {
      if (this.state_ === 1) {
        return new Promise((resolve) => {
          const controller = setInterval(() => {
            if (this.state_ === 2) {
              clearInterval(controller);
              resolve(true);
            }
          }, 500);
        });
      }
      return new Error('waitForDosingStart > state of the device is not 1.');
    }
    else {
      // support for web, wait 10segs (duration of the dosing) to return a true;
      await new Promise(resolve => setTimeout(resolve, 6500));
      return true;
    }
  }

  async checkDosing() {
    if (Capacitor.isNativePlatform()  && !this.layoutConfig.noDeviceMode) {
      return new Promise((resolve, reject) => {
        const controller = setInterval(() => {
          if (this.state_ === 3) {
            clearInterval(controller);
            resolve(true);
          }

          if (this.state_ === 4) {
            clearInterval(controller);
            reject(new Error('unpressed action device during dosing.'));
          }
        }, 500);
      });
    }
    else {
      // support for web, wait 10segs (duration of the dosing) to return a true;
      if (this.layoutConfig.noDeviceModeOopsFlow) {
        await new Promise((resolve, reject) => setTimeout(reject, 4000));
      }
      else {
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      return true;
    }
  }

  async isDeviceConnected() {
    if (Capacitor.isNativePlatform()  && !this.layoutConfig.noDeviceMode) {
      if (!this.isScanning_) {
        await this.scan();
      }

      return new Promise((resolve) => {
        const controller = setInterval(() => {
          if (this.isConnected_ || this.layoutConfig.noDeviceMode) {
            clearInterval(controller);
            resolve(true);
          }
          if (this.isConnected_){
            clearInterval(controller);
            resolve(true);
          }
        }, 500);
      });
    }
    else {
      // support for web, wait 10segs (duration of the dosing) to return a true;
      await new Promise(resolve => setTimeout(resolve, 3000));
      return true;
    }
  }

  async openSettingsApp() {
    if (Capacitor.isNativePlatform()) {
      await BleClient.openAppSettings();
    }
  }

  //--------------------------------------------------
  // Bluetooth Callbacks
  //--------------------------------------------------

  //--------------------------------------------------
  async onDeviceDiscovered(peripheral: any) {
    if (((peripheral.localName == "AutoMagic") ||
      (peripheral.device.name == "AutoMagic"))
      && (peripheral.rssi > -60)) {
      this.isConnected_ = true;
      this.isScanning_ = false;
      this.peripheral_ = peripheral;
      console.log("AutoMagic Discovered: ");
      console.log(peripheral);
      console.log("Name: " + peripheral.name_);
      console.log("RSSI: " + peripheral.rssi_);
      this.rssi_ = peripheral.rssi;
      this.uuid_ = peripheral.device.deviceId;

      if (Capacitor.isNativePlatform()) {
        await BleClient.stopLEScan();
        await BleClient.connect(peripheral.device.deviceId);
      }
      console.log('Connected to device', peripheral.device.deviceId);

      // Once connected, read the characteristic every 250ms.  
      // Discriminate state, battery, and dosing values
      const intervalDuration = 250;

      this.interval_id_ = setInterval(async () => {
        try {
          let data = 0;
          if (Capacitor.isNativePlatform()) {
            const reading = await BleClient.read(peripheral.device.deviceId, AUTOMAGIC_SERVICE, AUTOMAGIC_STATE_CHARACTERISTIC);
            if (reading.byteLength > 0)
              data = reading.getUint32(0);
          }
          else {
            data = (this.mock_dosing << 16) | (this.mock_battery << 8) | (this.mock_state);

            this.mock_state++;
            if (this.mock_state >= 5)
              this.mock_state = 0;
            this.mock_battery--;
            if (this.mock_battery <= 0)
              this.mock_battery = 100;
            this.mock_dosing++;
            if (this.mock_dosing >= 101)
              this.mock_dosing = 0;
          }
          console.log("From device: " + data);

          this.state_ = ((data >> 24) & 0xFF);
          this.battery_ = ((data >> 16) & 0xFF);
          this.dosage_ = ((data >> 8) & 0xFF);

          console.log("State: " + this.state_);
          console.log("Battery: " + this.battery_);
          console.log("Dosing: " + this.dosage_);
        }
        catch (error) {
          console.error('Error in interval callback:', error);
        }
      }, intervalDuration);
    }
  }

  //--------------------------------------------------
  async scan() {
    if (Capacitor.isNativePlatform() && !this.layoutConfig.noDeviceMode) {
      console.log("Is Native Capacitor bluetooth.service.ts scan");

      try {
        this.isScanning_ = true;
        await BleClient.requestLEScan(
          { allowDuplicates: true },
          this.onDeviceDiscovered.bind(this)
        );
      }
      catch (error) {
        console.error('scan', error);
        this.isScanning_ = false;
      }
    }
    else {
      // Not using an actual mobile device, therefore running on the browser
      // Mock this with fake found devices
      let peripheral_mock_1 = {
        localName: "Something else",
        device: { name: "Something else", deviceId: "ecb16f02-e281-4128-aea9-6c552910f250" },
        rssi: -45,
      };
      let peripheral_mock_2 = {
        localName: "AutoMagic",
        device: { name: "AutoMagic", deviceId: "cec50777-de5a-4884-a6a1-b247efa53231" },
        rssi: -90
      };
      let peripheral_mock_3 = {
        localName: "AutoMagic",
        device: { name: "AutoMagic", deviceId: "c702af3e-cef1-4858-a40a-d0a2e8280a88" },
        rssi: -45
      };

      this.onDeviceDiscovered(peripheral_mock_1);
      this.onDeviceDiscovered(peripheral_mock_2);
      this.onDeviceDiscovered(peripheral_mock_3);
    }
  }

  //--------------------------------------------------
  async stop() {
    clearInterval(this.interval_id_);
    this.isConnected_ = false;
    if (Capacitor.isNativePlatform()) {
      await BleClient.disconnect(this.peripheral_.device.deviceId);
    }
  }
}