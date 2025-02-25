import { HttpClient } from '@angular/common/http';
import { inject, Injectable, NgZone, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import {
  BleClient,
  numberToUUID,
  ScanResult,
} from '@capacitor-community/bluetooth-le';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import { Store } from '@ngrx/store';
import * as fromStore from '@shared/store';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  Observable,
  race,
  timeout,
  timer,
} from 'rxjs';

//--------------------------------------------------
// Constants
//--------------------------------------------------
const SERVICE_ARIA_DEVICE_INFORMATION = '0000180A-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_MFR_NAME_STRING = 0x2a29;
const CHARACTERISTIC_MODEL_NUMBER_STRING = 0x2a24;
const CHARACTERISTIC_SERIAL_NUMBER_STRING = 0x2a25;
const CHARACTERISTIC_SOFTWARE_REVISION_STRING = 0x2a28;
const CHARACTERISTIC_HARDWARE_REVISION_STRING = 0x2a27;

const SERVICE_ARIA_BATTERY = '0000180F-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_BATTERY_LEVEL = 0x2a19;

const SERVICE_ARIA_DEVICE_STATUS = 'CCFD0000-E3D9-49A4-A69E-246C9560FFDE';
const CHARACTERISTIC_DEVICE_STATE = 'CCFD4010-E3D9-49A4-A69E-246C9560FFDE';

const STATUS_NAMES: { [key: number]: string } = {
  0x00: 'Undefined',
  0x01: 'PoweringOn',
  0x02: 'PoweringOff',
  0x10: 'Charging',
  0x11: 'ChargingComplete',
  0x20: 'DeviceError',
  0x21: 'EndOfLife',
  0x22: 'BatteryLow',
  0x80: 'InsertCassette',
  0x81: 'PreparingCassette',
  0x82: 'RemoveNeedleCap',
  0x83: 'ReadyForInjection',
  0x84: 'Injecting',
  0x85: 'DwellTime',
  0x86: 'LiftFromInjectionSite',
  0x87: 'ReleasingCassette',
  0x88: 'RemoveCassette',
  0xa0: 'WarningInjectionIncomplete',
  0xa1: 'WarningCassette',
};

const ARIA_ADVERTISING_NAME = 'Aria NIS';
const ARIA_RSSI_THRESHOLD = -60;
const SCAN_TIMEOUT_MS = 45000; // 45 seconds scan timeout
const CONNECTION_TIMEOUT_MS = 30000; // 30 seconds connection timeout

//--------------------------------------------------
// Utility functions
//--------------------------------------------------
function dataViewToAsciiString(data_view: DataView): string {
  const decoder = new TextDecoder('ascii');
  return decoder.decode(data_view);
}

function dataViewToDecimal(data_view: DataView): number {
  if (data_view.byteLength === 0) {
    console.warn('DataView is empty');
    return -1;
  }
  return data_view.getUint8(0);
}

function dataViewToHighLowBytes(dataView: DataView): {
  high_byte: number;
  low_byte: number;
} {
  if (dataView.byteLength < 2) {
    console.error('DataView does not contain enough bytes (expected 2)');
    return { high_byte: -1, low_byte: -1 };
  }

  const value16bit = dataView.getUint16(0, false);
  const high_byte = (value16bit >> 8) & 0xff;
  const low_byte = value16bit & 0xff;

  return { high_byte, low_byte };
}

const AUTOMAGIC_SERVICE = 'EDFEC62E-9910-0BAC-5241-D8BDA6932A2F';
const AUTOMAGIC_STATE_CHARACTERISTIC = '5A87B4EF-3BFA-76A8-E642-92933C31434F';
const DEVICE_NAME = 'AutoMagic';

@Injectable({
  providedIn: 'root',
})
// OLD BLUETOOTH SERVICE
export class BluetoothService {
  // Injected services
  #store = inject(Store<fromCoreStore.LayoutState>);
  #http = inject(HttpClient);
  #ngZone = inject(NgZone);
  #formBuilder = inject(FormBuilder);

  // Device state
  #devices: ScanResult[] = [];
  #connected = false;
  #scanning = false;
  #device: any = {};
  #rssi = 0;
  #name = '';
  #battery = 0;
  #manufacturer = '';
  #serial = '';
  #model = '';
  #softwareRevision = '';
  #hardwareRevision = '';
  #previousState = 0;
  readonly #isNativePlatform = Capacitor.isNativePlatform();

  // Observables and subjects
  #state = new BehaviorSubject<number>(0);
  readonly state$ = this.#state.asObservable();

  #stateData = new BehaviorSubject<number>(0);
  readonly stateData$ = this.#stateData.asObservable();

  // Store configs
  readonly layoutConfig$ = this.#store.select(fromCoreStore.getLayoutConfig);
  layoutConfig: any;
  readonly homeConfig$ = this.#store.select(fromHomeStore.getHomeConfig);
  homeConfig: any;

  // Forms
  readonly trackingDateForm = this.#formBuilder.group({
    device: ['', [Validators.required, Validators.minLength(5)]],
    previous_state: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    new_state: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    battery: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.min(0),
        Validators.max(100),
      ],
    ],
    dosage: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.min(0),
        Validators.max(100),
      ],
    ],
  });

  // Device state signals
  #connectedSignal = signal<boolean>(false);
  readonly connected$: Observable<boolean> = toObservable(
    this.#connectedSignal
  );

  #deviceStateSignal = signal<number>(0);
  readonly deviceState$: Observable<number> = toObservable(
    this.#deviceStateSignal
  );

  constructor() {
    this.#initializeSubscriptions();
    this.#initializeAppStateListener();
  }

  //--------------------------------------------------
  // Initialization Methods
  //--------------------------------------------------
  #initializeSubscriptions(): void {
    this.layoutConfig$.subscribe((layoutConfig) => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
        if (this.layoutConfig.dosageDevice.isConnected !== this.#connected) {
          this.#connected = this.layoutConfig.dosageDevice.isConnected;
        }
      }
    });

    this.homeConfig$.subscribe((homeConfig) => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });

    this.state$.subscribe((state: number) => {
      if (state) {
        this.#store.dispatch(
          new fromCoreStore.SetDosageDeviceInfo({
            state: state,
          })
        );
      }
    });

    this.stateData$.subscribe((stateData: number) => {
      if (stateData) {
        this.#store.dispatch(
          new fromCoreStore.SetDosageDeviceInfo({
            state_data: stateData,
          })
        );
      }
    });
  }

  #initializeAppStateListener(): void {
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive && this.#connected) {
        await this.stop();
      }
    });
  }

  //--------------------------------------------------
  // Public Properties
  //--------------------------------------------------
  get IsScanning(): boolean {
    return this.#scanning;
  }

  get Devices(): any[] {
    return this.#devices;
  }

  get Name(): string {
    return this.#name;
  }

  get RSSI(): number {
    return this.#rssi;
  }

  get State(): string {
    const currentState = this.#state.value;
    return STATUS_NAMES[currentState];
  }

  get StateId(): number {
    return this.#state.value;
  }

  get StateRaw(): number {
    const currentState = this.#state.value;
    const currentStateData = this.#stateData.value;
    return (currentState << 8) | currentStateData;
  }

  get StateData(): number {
    return this.#stateData.value;
  }

  get Battery(): number {
    return this.#battery;
  }

  get Manufacturer(): string {
    return this.#manufacturer;
  }

  get Model(): string {
    return this.#model;
  }

  get Serial(): string {
    return this.#serial;
  }

  get SoftwareRevision(): string {
    return this.#softwareRevision;
  }

  get HardwareRevision(): string {
    return this.#hardwareRevision;
  }

  get Connected(): boolean {
    return this.#connected;
  }

  //--------------------------------------------------
  // State Management Methods
  //--------------------------------------------------
  #updateState(newState: number): void {
    this.#previousState = this.#state.value;
    this.#state.next(newState);
    this.#deviceStateSignal.set(newState);
  }

  #updateStateData(newStateData: number): void {
    this.#stateData.next(newStateData);
  }

  //--------------------------------------------------
  // Core Bluetooth Methods
  //--------------------------------------------------
  async scan(): Promise<void> {
    console.log('Starting Bluetooth scan...');

    this.#devices = [];
    this.#scanning = true;

    if (this.#isNativePlatform) {
      try {
        await BleClient.initialize();
        console.log('BLE initialized successfully');

        // Create a timeout promise
        const scanTimeout = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Scan timeout'));
          }, SCAN_TIMEOUT_MS);
        });

        // Create a scan promise
        const scanPromise = new Promise<void>(async (resolve) => {
          await BleClient.requestLEScan(
            {
              allowDuplicates: false,
              namePrefix: ARIA_ADVERTISING_NAME,
            },
            async (result) => {
              if (!result.device?.name) return;

              const deviceName: string = result.device.name;
              if (deviceName.includes(ARIA_ADVERTISING_NAME)) {
                this.#ngZone.run(async () => {
                  console.log('Found Aria device:', {
                    name: deviceName,
                    rssi: result.rssi,
                    deviceId: result.device.deviceId,
                    state: this.#connected ? 'connected' : 'not connected',
                  });

                  // Only proceed if we haven't connected yet
                  if (!this.#connected) {
                    await this.#stopScan();
                    await this.connect(result);
                    resolve();
                  }
                });
              }
            }
          );
        });

        // Race between scan completion and timeout
        await Promise.race([scanPromise, scanTimeout]).catch(async (error) => {
          console.error('Scan error:', error);
          await this.#stopScan();
          if (this.#devices.length === 0) {
            await this.#showTroubleConnectingBackdrop();
          }
        });
      } catch (error) {
        console.error('Scan initialization error:', error);
        this.#scanning = false;
        await this.#showTroubleConnectingBackdrop();
      }
    }
  }

  async connect(device: any): Promise<void> {
    console.log('Attempting to connect to device:', device.device.name);

    await this.#stopScan();

    if (this.#isNativePlatform) {
      try {
        this.#device = device;
        await BleClient.connect(device.device.deviceId, () => {
          console.log('Device disconnected callback triggered');
          this.#handleDisconnection();
        });

        console.log('Connected to device successfully');
        this.#connected = true;
        this.#connectedSignal.set(true);
        this.#store.dispatch(
          new fromCoreStore.SetDosageDeviceInfo({
            isConnected: true,
          })
        );

        await this.#initializeDeviceAfterConnection();
      } catch (error) {
        console.error('Connection error:', error);
        this.#handleDisconnection();
        await this.#showTroubleConnectingBackdrop();
      }
    }
  }

  async #initializeDeviceAfterConnection(): Promise<void> {
    try {
      console.log('Initializing device after connection...');
      await this.#startDeviceStateNotifications();
      await this.#getDeviceData();
      await this.#getBatteryLevel();
      console.log('Device initialization complete');
    } catch (error) {
      console.error('Device initialization error:', error);
      await this.#handleDisconnection();
    }
  }

  #handleDisconnection(): void {
    console.log('Handling device disconnection');
    this.#connected = false;
    this.#connectedSignal.set(false);
    this.#store.dispatch(
      new fromCoreStore.SetDosageDeviceInfo({
        isConnected: false,
      })
    );
  }

  async stop(): Promise<void> {
    console.log('Stopping device connection');
    if (this.#isNativePlatform && this.#device?.device?.deviceId) {
      try {
        await BleClient.disconnect(this.#device.device.deviceId);
        console.log('Device disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting device:', error);
      }
    }
    this.#handleDisconnection();
    this.#devices = [];
  }

  #stopScan = async (): Promise<void> => {
    if (this.#isNativePlatform) {
      try {
        await BleClient.stopLEScan();
        console.log('Scan stopped successfully');
      } catch (error) {
        console.error('Error stopping scan:', error);
      }
    }
    this.#scanning = false;
  };

  //--------------------------------------------------
  // Device Data Methods
  //--------------------------------------------------
  async #getDeviceData(): Promise<boolean> {
    if (this.#isNativePlatform) {
      try {
        const result_manufacturer_name = await BleClient.read(
          this.#device.device.deviceId,
          SERVICE_ARIA_DEVICE_INFORMATION,
          numberToUUID(CHARACTERISTIC_MFR_NAME_STRING)
        );
        this.#manufacturer = dataViewToAsciiString(result_manufacturer_name);

        const result_model_number = await BleClient.read(
          this.#device.device.deviceId,
          SERVICE_ARIA_DEVICE_INFORMATION,
          numberToUUID(CHARACTERISTIC_MODEL_NUMBER_STRING)
        );
        this.#model = dataViewToAsciiString(result_model_number);

        const result_serial_number = await BleClient.read(
          this.#device.device.deviceId,
          SERVICE_ARIA_DEVICE_INFORMATION,
          numberToUUID(CHARACTERISTIC_SERIAL_NUMBER_STRING)
        );
        this.#serial = dataViewToAsciiString(result_serial_number);

        const result_software_revision = await BleClient.read(
          this.#device.device.deviceId,
          SERVICE_ARIA_DEVICE_INFORMATION,
          numberToUUID(CHARACTERISTIC_SOFTWARE_REVISION_STRING)
        );
        this.#softwareRevision = dataViewToAsciiString(
          result_software_revision
        );

        const result_hardware_revision = await BleClient.read(
          this.#device.device.deviceId,
          SERVICE_ARIA_DEVICE_INFORMATION,
          numberToUUID(CHARACTERISTIC_HARDWARE_REVISION_STRING)
        );
        this.#hardwareRevision = dataViewToAsciiString(
          result_hardware_revision
        );
      } catch (error) {
        console.error('Error reading device information:', error);
        return false;
      }
    }
    return true;
  }

  async #getBatteryLevel(): Promise<boolean> {
    if (this.#isNativePlatform) {
      try {
        const result_battery = await BleClient.read(
          this.#device.device.deviceId,
          SERVICE_ARIA_BATTERY,
          numberToUUID(CHARACTERISTIC_BATTERY_LEVEL)
        );
        this.#battery = dataViewToDecimal(result_battery);

        this.#store.dispatch(
          new fromCoreStore.SetDosageDeviceInfo({
            battery: this.#battery,
          })
        );
      } catch (error) {
        console.error('Error reading battery level:', error);
        return false;
      }
    }
    return true;
  }

  async #startDeviceStateNotifications(): Promise<boolean> {
    if (this.#isNativePlatform) {
      try {
        await BleClient.startNotifications(
          this.#device.device.deviceId,
          SERVICE_ARIA_DEVICE_STATUS,
          CHARACTERISTIC_DEVICE_STATE,
          (result_state) => {
            const { high_byte, low_byte } =
              dataViewToHighLowBytes(result_state);
            this.#updateState(high_byte);
            this.#updateStateData(low_byte);
          }
        );
      } catch (error) {
        console.error('Error starting device state notifications:', error);
        return false;
      }
    }
    return true;
  }

  //--------------------------------------------------
  // Bluetooth Callbacks
  //--------------------------------------------------
  async #onDeviceDiscovered(peripheral: any): Promise<void> {
    if (!peripheral.device?.name) {
      return;
    }

    const deviceName: string = peripheral.device.name;
    if (deviceName.includes(ARIA_ADVERTISING_NAME)) {
      this.#ngZone.run(() => {
        console.log('Found Aria device:', {
          name: deviceName,
          rssi: peripheral.rssi,
          deviceId: peripheral.device.deviceId,
          state: this.#connected ? 'connected' : 'not connected',
        });

        // Only add device if it's not already in the list
        const existingDevice = this.#devices.find(
          (d) => d.device.deviceId === peripheral.device.deviceId
        );
        if (!existingDevice) {
          this.#devices.push(peripheral);
          console.log(
            'Added new device to list, total devices:',
            this.#devices.length
          );
        }
      });
    }
  }

  //--------------------------------------------------
  // Public API Methods
  //--------------------------------------------------
  async checkPermissions(): Promise<'granted' | 'not-allowed'> {
    console.log('checkPermissions');
    if (this.#isNativePlatform) {
      try {
        await BleClient.initialize();
        const enabled = await BleClient.isEnabled();
        return enabled ? 'granted' : 'not-allowed';
      } catch (error) {
        console.error('Error checking permissions:', error);
        return 'not-allowed';
      }
    }
    return 'granted';
  }

  async openSettingsApp(): Promise<void> {
    console.log('openSettingsApp');
    if (this.#isNativePlatform) {
      await BleClient.openAppSettings();
    }
  }

  async isDeviceConnected(): Promise<boolean> {
    console.log('isDeviceConnected - current state:', this.#connected);

    if (this.#connected) {
      return true;
    }

    if (!this.#scanning) {
      console.log('Starting device scan...');
      await this.scan();
    }

    try {
      // Create an observable that emits when connection is successful
      const connectionSuccess$ = this.connected$.pipe(
        filter((connected: boolean) => connected),
        map(() => true)
      );

      // Create a timeout observable
      const connectionTimeout$ = timer(CONNECTION_TIMEOUT_MS).pipe(
        map(() => {
          console.log('Connection attempt timed out');
          throw new Error('Connection timeout');
        })
      );

      // Race between successful connection and timeout
      const result = await firstValueFrom(
        race(connectionSuccess$, connectionTimeout$)
      );

      return result;
    } catch (error) {
      console.error('Connection failed:', error);
      await this.#showTroubleConnectingBackdrop();
      return false;
    }
  }

  async waitForDosingStart(continueDose?: boolean): Promise<boolean> {
    console.log('waitForDosingStart');

    if (!this.#connected) {
      console.log('Device not connected, attempting to connect...');
      try {
        const connected = await this.isDeviceConnected();
        if (!connected) {
          console.log('Failed to connect to device');
          await this.#showDisconnectionTimeoutAlert();
          return false;
        }
      } catch (error) {
        console.error('Error connecting to device:', error);
        return false;
      }
    }

    console.log('Device connected, waiting for state change...');

    try {
      // Wait for either ReadyForInjection or DeviceError state
      const stateChange$ = this.deviceState$.pipe(
        filter((state: number) => state === 0x83 || state === 0x20),
        map((state) => {
          if (state === 0x83) {
            console.log('Device ready for injection');
            return true;
          } else {
            console.log('Device error detected');
            throw new Error('Device error during dosing preparation');
          }
        }),
        timeout(30000) // 30 seconds timeout
      );

      return await firstValueFrom(stateChange$);
    } catch (error: unknown) {
      console.error('Error waiting for dosing start:', error);
      if (error instanceof Error && error.name === 'TimeoutError') {
        console.log('Connection timeout, showing alert');
        await this.#showDisconnectionTimeoutAlert();
      }
      return false;
    }
  }

  async checkDosing(): Promise<boolean> {
    console.log('checkDosing');

    try {
      // Wait for either completion, incomplete, or error state
      const dosingState$ = this.deviceState$.pipe(
        filter(
          (state: number) => state === 0x88 || state === 0xa0 || state === 0x20
        ),
        map((state) => {
          switch (state) {
            case 0x88:
              console.log('Injection complete');
              return true;
            case 0xa0:
              throw new Error('Injection incomplete');
            case 0x20:
              throw new Error('Device error during injection');
            default:
              return false;
          }
        })
      );

      return await firstValueFrom(dosingState$);
    } catch (error) {
      console.error('Error during dosing:', error);
      return false;
    }
  }

  //--------------------------------------------------
  // UI Feedback Methods
  //--------------------------------------------------
  async #showTroubleConnectingBackdrop(): Promise<void> {
    console.log('Showing trouble connecting backdrop');
    this.#store.dispatch(
      new fromStore.BackdropShow({
        transition: 'move',
        header: true,
        showBackButton: false,
        template: `
        <div class="trouble-connecting-message">
          <h1 class="font-heading-1--bold">Trouble connecting?</h1>
          <img src="assets/images/dosing-trouble-connecting.svg">
          <p>The injector may need to be reset. <br>Press down on the needle guard <br>until it clicks to reset and release. <br>You do not need to hold.</p>
          <p>This demo unit does not have a <br>needle nor drug substance.</p>
          <p>When the injector lights return to <br>solid white, it's ready to continue.</p>
        </div>
      `,
        buttons: [
          {
            label: 'Continue',
            action: async () => {
              console.log('Restarting bluetooth discovery');
              this.#store.dispatch(new fromStore.BackdropHide());
              // Reset state
              this.#connected = false;
              this.#devices = [];
              this.#scanning = false;
              // Start fresh scan
              await this.scan();
            },
          },
        ],
        onClose: async () => {
          await this.stop();
          await this.scan();
        },
      })
    );
  }

  async #showDisconnectionTimeoutAlert(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.#store.dispatch(
        new fromStore.AlertShow({
          mode: 'window',
          overlay: true,
          template: `
          <div class="connection-time-out-alert">
            <img src="assets/images/alert-warning.svg" />
            <h3>Device connection timeout</h3>
            <p>The injector may need to be reset. <br>Press down on the needle guard until <br>it clicks to reset and release. You do <br>not need to hold.</p>
            <p>This demo unit does not have a <br>needle nor drug substance.</p>
            <p>When the injector lights return to <br>solid white, it's ready to continue.</p>
          </div>
        `,
          actions: [
            {
              label: 'Continue',
              fill: 'outline',
              action: async () => {
                try {
                  await this.scan();
                  this.#store.dispatch(new fromStore.AlertHide());
                  resolve(true);
                } catch (error) {
                  reject(error);
                }
              },
            },
          ],
        })
      );
    });
  }

  //--------------------------------------------------
  // Utility Methods
  //--------------------------------------------------
  logger(action: string, message?: string): void {
    console.log(
      `Logger: action ${action} ${message ? `output: ${message}` : ''}`
    );

    const stats = {
      'Is Device Connected?': this.#connected,
      'Is Scanning': this.#scanning,
      State: this.State,
      'State Data': this.StateData,
      Battery: this.Battery,
    };

    console.log('Current Stats:', stats);
  }

  setBattery(value: number): void {
    this.#battery = value;
    this.#store.dispatch(
      new fromCoreStore.SetDosageDeviceInfo({
        battery: value,
      })
    );
  }
}
