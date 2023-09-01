import { Injectable } from '@angular/core';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@shared/store';
import * as fromCoreStore from '@core/store';

const AUTOMAGIC_SERVICE = 'EDFEC62E-9910-0BAC-5241-D8BDA6932A2F';
const AUTOMAGIC_STATE_CHARACTERISTIC = '5A87B4EF-3BFA-76A8-E642-92933C31434F';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {
  private bleEnabled: boolean;
  private uuid_: string;
  private rssi_: number;
  private state_: number;
  private dosage_: number;
  private battery_: number;
  private batterySubject: Subject<number> = new Subject<number>();
  public battery$: Observable<number> = this.batterySubject.asObservable();
  private peripheral_: any;
  private isConnected_: boolean;
  private isScanning_: boolean;
  private interval_id_!: any;

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
    this.bleEnabled = false;
    this.uuid_ = '';
    this.rssi_ = 0;
    this.state_ = 0;
    this.battery_ = 0;
    this.dosage_ = 0;
    this.setBattery(0);
    this.isConnected_ = false;
    this.isScanning_ = false;

    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.layoutConfig$.subscribe(layoutConfig => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
      }
    });

    this.battery$.subscribe((batteryLevel: number) => {
      if (batteryLevel) {
        this._store.dispatch(new fromCoreStore.SetBatteryOfDevice(batteryLevel));
      }
    });

    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        if (this.bleEnabled && this.isConnected_) {
          await this.handlerDisconnectDevice();
        }
      }
    });
  }

  setBattery(value: number) {
    this.battery_ = value;
    this.batterySubject.next(this.battery_);
  }

  //--------------------------------------------------
  // Bluetooth Actions
  //--------------------------------------------------
  async checkPermissions() {
    this.logger('checkPermissions');

    if (Capacitor.isNativePlatform()) {
      await BleClient.initialize();
      this.bleEnabled = await BleClient.isEnabled();
      return new Promise((resolve, reject) => {
        if (this.bleEnabled) {
          this.logger('BleClient is enabled?', `${this.bleEnabled}`);
          resolve('granted');
        }
        else {
          this.logger('BleClient is not Allowed');
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

  async openSettingsApp() {
    this.logger('openSettingsApp');

    if (Capacitor.isNativePlatform()) {
      await BleClient.openAppSettings();
    }
  }

  async scan() {
    this.logger('scan');

    if (Capacitor.isNativePlatform() && !this.layoutConfig.noDeviceMode) {
      try {
        this.logger('scan: Start Scanning');
        this.isScanning_ = true;
        await BleClient.requestLEScan(
          { allowDuplicates: true },
          this.onDeviceDiscovered.bind(this)
        );
      }
      catch (error: any) {
        this.logger('scan: Error', `${error}`);
        this.isScanning_ = false;
      }
    }
    else {
      // Not using an actual mobile device, therefore running on the browser
      // Mock this with fake found devices
      this.onDeviceDiscovered({
        localName: "AutoMagic",
        device: { name: "AutoMagic", deviceId: "cec50777-de5a-4884-a6a1-b247efa53231" },
        rssi: -90
      });
    }
  }

  async handlerDisconnectDevice() {
    this.logger('handlerDisconnectDevice');

    if (this.interval_id_) {
      clearInterval(this.interval_id_);
      this.logger(`handlerDisconnectDevice: Clearing reading`);
    }

    if (Capacitor.isNativePlatform() && !this.layoutConfig.noDeviceMode) {
      await BleClient.disconnect(this.peripheral_.device.deviceId); 
    }

    this.isConnected_ = false;
    this._store.dispatch(new fromCoreStore.SetIsDeviceConnected(false));
    this.logger('handlerDisconnectDevice: Device disconnected', `ID: ${this.peripheral_.device.deviceId}`);
  }

  async isDeviceConnected() {
    this.logger('isDeviceConnected');

    if (!this.isConnected_ && !this.isScanning_) {
      this.logger(`isDeviceConnected: Running a scan`);
      await this.scan();
      this.logger(`isDeviceConnected: Scan finished`);
    }

    if (Capacitor.isNativePlatform() && !this.layoutConfig.noDeviceMode) {
      const startWatcher = moment();
      return new Promise((resolve) => {
        const controller = setInterval(() => {
          this.logger(`isDeviceConnected: Is the device connected?`, `${this.isConnected_}`);
          if (this.isConnected_) {
            this.logger(`isDeviceConnected: Device connected`);
            clearInterval(controller);
            resolve(true);
          }
          else {
            if (startWatcher.diff(moment(), 'seconds') === -30) {
              this.logger(`isDeviceConnected: After 30 seconds is still not connecting`);
              this.showTroubleConnectingBackdrop();
            }
          }
        }, 1000);
      });
    }
    else {
      // support for web, wait 3segs to advance.
      await new Promise(resolve => setTimeout(resolve, 3000));
      return true;
    }
  }

  async waitForDosingStart(continueDose?: boolean) {
    this.logger('waitForDosingStart');

    if (!this.isConnected_) {
      this.logger('waitForDosingStart: The device is not connected');
      // await this.showDisconectionTimeOutAlert();
      this.logger('finished showDisconectionTimeOutAlert');
    }

    if (Capacitor.isNativePlatform()  && !this.layoutConfig.noDeviceMode) {
      if (this.state_ === 1) {
        return new Promise((resolve) => {
          const controller = setInterval(() => {
            this.logger(`waitForDosingStart: State is: ${this.state_}`);

            if (this.state_ === 2) {
              this.logger('waitForDosingStart: Device was activated, continue to Dosing');
              clearInterval(controller);
              resolve(true);
            }
          }, 100);
        });
      }
      else {
        this.logger('waitForDosingStart: Error', `the state is: ${this.state_} and it should be 1`);
        return new Error(`waitForDosingStart: Error the state is: ${this.state_} and it should be 1`);
      }
    }
    else {
      // support for web, wait 10segs (duration of the dosing) to return a true;
      await new Promise(resolve => setTimeout(resolve, continueDose ? 0 : 6500));
      return true;
    }
  }

  async checkDosing(remainingDose?: number) {
    this.logger('checkDosing');

    if (Capacitor.isNativePlatform()  && !this.layoutConfig.noDeviceMode) {
      return new Promise((resolve, reject) => {
        const controller = setInterval(() => {
          this.logger(`checkDosing: State is: ${this.state_}`);

          if (this.state_ === 3) {
            this.logger('checkDosing: Dosing done', `Dose completed successfully. State is ${this.state_}`);
            clearInterval(controller);
            resolve(true);
          }

          if (this.state_ === 4) {
            this.logger('checkDosing: Interrupted', `Unpressed action on device during dosing. State is ${this.state_}`);
            clearInterval(controller);
            reject(new Error('unpressed action device during dosing.'));
          }
        }, 100);
      });
    }
    else {
      // support for web, wait 10segs (duration of the dosing) to return a true;
      if (this.layoutConfig.noDeviceModeOopsFlow) {
        await new Promise((resolve, reject) => setTimeout(reject, remainingDose ? remainingDose : (Math.floor(Math.random() * 10)) * 1000));
      }
      else {
        await new Promise(resolve => setTimeout(resolve, remainingDose ? remainingDose : 10000));
      }
      return true;
    }
  }

  //--------------------------------------------------
  // Bluetooth Callbacks
  //--------------------------------------------------
  async onDeviceDiscovered(peripheral: any) {
    this.logger(`onDeviceDiscovered`);

    if (
      peripheral.localName == 'AutoMagic' || 
      peripheral.device.name == 'AutoMagic' && 
      peripheral.rssi > -60
    ) {
      this.logger('onDeviceDiscovered: Device to Connect', `${peripheral.device.deviceId}`);

      this.peripheral_ = peripheral;
      this.rssi_ = peripheral.rssi;
      this.uuid_ = peripheral.device.deviceId;

      if (Capacitor.isNativePlatform() && !this.layoutConfig.noDeviceMode) {
        try {
          await BleClient.stopLEScan();
          this.isScanning_ = false;
          await BleClient.connect(this.peripheral_.device.deviceId, () => this.handlerDisconnectDevice());
          this.isConnected_ = true;
          this.logger('onDeviceDiscovered: Device connected successsfully');
        }
        catch(error) {
          this.logger(`onDeviceDiscovered: Error`, `${error}`);
        }
      }
      else {
        this.isScanning_ = false;
        this.isConnected_ = true;
      }

      // Once connected, read the characteristic every 250ms.  
      // Discriminate state, battery, and dosing values
      const intervalDuration = 250;
      this.logger('onDeviceDiscovered: Starting reading of stats from the device');
      this.interval_id_ = setInterval(async() => {
        try {
          if (Capacitor.isNativePlatform() && !this.layoutConfig.noDeviceMode) {
            this.logger(`onDeviceDiscovered: Reading of connected device`);

            const reading = await BleClient.read(this.peripheral_.device.deviceId, AUTOMAGIC_SERVICE, AUTOMAGIC_STATE_CHARACTERISTIC);
            if (reading.byteLength > 0) {
              let data = reading.getUint32(0);
              const bytes = [];
              while (data > 0) { 
                bytes.unshift(data & 0xFF);
                data >>= 8;
              }

              this.logger('onDeviceDiscovered: Data from Device', bytes.join(', '));

              this.state_ = bytes[0];
              this.setBattery(bytes[1]);
              this.dosage_ = bytes[2];

              this.logger('onDeviceDiscovered: Device Stats', `
                State: ${this.state_}
                Battery: ${this.battery_}
                Dosage: ${this.dosage_}
              `);

              if (!this.layoutConfig.isDeviceConnected) {
                this._store.dispatch(new fromCoreStore.SetIsDeviceConnected(true));
              }
            }
            else {
              this.logger(`onDeviceDiscovered: No data device obtained`);
              this._store.dispatch(new fromCoreStore.SetIsDeviceConnected(false));
              if (!this.isScanning_) {
                this.logger('onDeviceDiscovered: Error', 'Looks like the device is desconected, runing scan again');
                await this.scan();
                this.logger('onDeviceDiscovered: Error', 'Scan finished');
              }
              clearInterval(this.interval_id_);
            }
          }
          else {
            this.state_ = this.mock_state;
            this.setBattery(this.mock_battery);
            this.dosage_ = this.mock_dosing;

            if (!this.layoutConfig.isDeviceConnected) {
              this._store.dispatch(new fromCoreStore.SetIsDeviceConnected(true));
            }
            clearInterval(this.interval_id_);
          }
        }
        catch (error: any) {
          this.logger(`onDeviceDiscovered: Error`, `${error}`);
          this._store.dispatch(new fromCoreStore.SetIsDeviceConnected(false));
          if (!this.isScanning_) {
            this.logger('onDeviceDiscovered: Error', 'Looks like the device is desconected, runing scan again');
            await this.scan();
            this.logger('onDeviceDiscovered: Error', 'Scan finished');
          }
          clearInterval(this.interval_id_);
        }
      }, intervalDuration);
    }
  }

  //--------------------------------------------------
  // Bluetooth Utilities
  //--------------------------------------------------
  logger(action: string, message?: string) {
    const logsWrapper = document.getElementById('device-debugging-logs');
    if (logsWrapper) {
      const newAction = document.createElement('div');
      newAction.classList.add('action');
      newAction.style.paddingTop = 'var(--size-xxs)';
      newAction.style.paddingBottom = 'var(--size-xxs)';
      newAction.style.borderTop = '2px solid var(--color-gray-medium)';
      newAction.innerHTML = `
        <h5 style="margin: 0;">Action: ${action}</h5>
        ${ message ?`
          <h5>Output</h5>
          <p>${message}</p>
          <h5>Stats</h5>
          <p><strong>Is Device Connected?:</strong> ${this.isConnected_}</p>
          <p><strong>Is Scanning:</strong> ${this.isScanning_}</p>
          <p><strong>State:</strong> ${this.state_}</p>
          <p><strong>Dosage:</strong> ${this.dosage_}</p>
          <p style="margin-bottom: 0"><strong>Battery:</strong> ${this.battery_}</p>
        `: '' }
      `;
      logsWrapper.insertBefore(newAction, logsWrapper.firstChild);
    }

    console.log(`Logger: action ${action} ${message ? `output: ${message}` : ''}`);
  }

  async showTroubleConnectingBackdrop() {
    this.logger(`showTroubleConnectingBackdrop`);
    this._store.dispatch(new fromStore.BackdropShow({
      transition: 'move',
      header: true,
      template: `
        <div class="trouble-connecting-message">
          <h1 class="font-heading-1--bold">Trouble connecting?</h1>
          <img src="assets/images/dosing-trouble-connecting.svg">
          <p>The injector may need to be reset. Press down on the needle guard until it clicks to reset.</p>
          <p>This demo unit <strong>does not have</strong> a needle nor drug substance.</p>
        </div>
      `,
      onClose: async () => {
        await this.handlerDisconnectDevice();
        await this.scan();
      }
    }));
  }

  async showDisconectionTimeOutAlert() {
    this.logger(`showDisconectionTimeOutAlert`);
    return new Promise((resolve, reject) => {
      this._store.dispatch(new fromStore.AlertShow({
        mode: 'window',
        overlay: true,
        template: `
          <div class="connection-time-out-alert">
            <img src="assets/images/alert-warning.svg" />
            <h3>Device connection timeout</h3>
            <p>The connection to your AutoMagic <br>injector has timed out. Please <br>reconnect by picking up the <br>autoinjector and then pressing <br>“Reconnect”</p>
          </div>
        `,
        actions: [
          {
            label: 'Reconnect',
            fill: 'outline',
            action: async () => {
              try {
                this.logger('showDisconectionTimeOutAlert: Run a scan');
                await this.scan();
                this.logger('showDisconectionTimeOutAlert: Scan finished');
                this._store.dispatch(new fromStore.AlertHide);
                resolve(true);
              }
              catch(error) {
                reject(error);
              }
            },
          }
        ],
      }));
    });
  }
}
