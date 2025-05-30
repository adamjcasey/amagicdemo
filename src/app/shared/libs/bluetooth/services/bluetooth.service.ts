import { inject, Injectable, NgZone } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  BleClient,
  numberToUUID,
  ScanResult,
} from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import * as fromCoreStore from '@core/store';
import { Store } from '@ngrx/store';
import * as fromSharedStore from '@shared/store';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  race,
  take,
  timer,
} from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ARIA_ADVERTISING_NAME,
  CHARACTERISTIC_BATTERY_LEVEL,
  CHARACTERISTIC_DEVICE_STATE,
  CHARACTERISTIC_HARDWARE_REVISION_STRING,
  CHARACTERISTIC_MFR_NAME_STRING,
  CHARACTERISTIC_MODEL_NUMBER_STRING,
  CHARACTERISTIC_SERIAL_NUMBER_STRING,
  CHARACTERISTIC_SOFTWARE_REVISION_STRING,
  CONNECTION_TIMEOUT_MS,
  DeviceStateCode,
  SCAN_TIMEOUT_MS,
  SERVICE_ARIA_BATTERY,
  SERVICE_ARIA_DEVICE_INFORMATION,
  SERVICE_ARIA_DEVICE_STATUS,
  STATUS_NAMES,
} from '../constants/bluetooth.constants';
import * as fromBluetoothStore from '../store';
import { getUseMockDevice } from '../store/bluetooth.reducer';
import {
  dataViewToAsciiString,
  dataViewToDecimal,
  dataViewToHighLowBytes,
} from '../utils/data-converters';
import { BluetoothMockDeviceProvider } from './bluetooth-mock-device-provider.service';

@Injectable({
  providedIn: 'root',
})
export class BluetoothService {
  #store = inject(Store<fromCoreStore.LayoutState>);
  #ngZone = inject(NgZone);
  #formBuilder = inject(FormBuilder);
  #bluetoothMockDeviceProvider = inject(BluetoothMockDeviceProvider);

  #devices: ScanResult[] = [];
  #connected = false;
  #scanning = false;
  #connectionInProgress = false;
  #device: any = {};
  #rssi = 0;
  #name = '';
  #battery = 0;
  #manufacturer = '';
  #serial = '';
  #model = '';
  #softwareRevision = '';
  #hardwareRevision = '';
  readonly #isNativePlatform = Capacitor.isNativePlatform();

  #state = new BehaviorSubject<number>(0);
  readonly state$ = this.#state.asObservable();

  #stateData = new BehaviorSubject<number>(0);
  readonly stateData$ = this.#stateData.asObservable();

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

  /**
   * @deprecated The method should not be used
   */
  #connectedSubject = new BehaviorSubject<boolean>(false);
  readonly connected$ = this.#connectedSubject.asObservable();

  #deviceStateSubject = new BehaviorSubject<number>(0);
  readonly deviceState$ = this.#deviceStateSubject.asObservable();

  #silentReconnectInProgress = false;

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
    const currentState = this.#state.value as DeviceStateCode;
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

  constructor() {
    this.#initializeSubscriptions();
  }

  //--------------------------------------------------
  // Initialization Methods
  //--------------------------------------------------
  #initializeSubscriptions(): void {
    this.state$.subscribe((state: number) => {
      if (state) {
        this.#store.dispatch(new fromBluetoothStore.UpdateDeviceState(state));
      }
    });

    this.stateData$.subscribe((stateData: number) => {
      if (stateData) {
        this.#store.dispatch(
          new fromBluetoothStore.UpdateDeviceStateData(stateData)
        );
      }
    });
  }

  //--------------------------------------------------
  // State Management Methods
  //--------------------------------------------------
  #updateState(newState: number): void {
    this.#state.next(newState);
    this.#deviceStateSubject.next(newState);

    this.#store.dispatch(new fromBluetoothStore.UpdateDeviceState(newState));
  }

  #updateStateData(newStateData: number): void {
    this.#stateData.next(newStateData);

    this.#store.dispatch(
      new fromBluetoothStore.UpdateDeviceStateData(newStateData)
    );
  }

  //--------------------------------------------------
  // Core Bluetooth Methods
  //--------------------------------------------------
  async scan(options?: { silent?: boolean }): Promise<void> {
    console.log(
      'Starting Bluetooth scan...',
      options?.silent ? '(silent)' : ''
    );

    if (this.#scanning) {
      console.log('Scan already in progress, skipping');
      return;
    }

    if (this.#silentReconnectInProgress && !options?.silent) {
      console.log('Silent reconnect in progress, skipping regular scan');
      return;
    }

    this.#devices = [];
    this.#scanning = true;
    this.#silentReconnectInProgress = !!options?.silent;

    const useMockDevice = await firstValueFrom(
      this.#store.select(getUseMockDevice)
    );
    if (useMockDevice) {
      console.log('Reconnect: Using mocked device');
      await this.#bluetoothMockDeviceProvider.provideMockDevice(
        useMockDevice && !this.#silentReconnectInProgress
      );
      this.#scanning = false;
      this.#silentReconnectInProgress = false;
      return;
    }

    if (this.#isNativePlatform) {
      try {
        await this.#initializeBLE();
        await this.#performBLEScan(options?.silent);
      } catch (error) {
        console.error('Reconnect: Error initializing BLE:', error);
        if (!options?.silent && this.#scanning) {
          await this.#showTroubleConnectingBackdrop();
        }
      } finally {
        if (this.#scanning) {
          this.#scanning = false;
          if (options?.silent) {
            this.#silentReconnectInProgress = false;
          }
        }
      }
    }
  }

  /**
   * Initializes the BLE client
   */
  async #initializeBLE(): Promise<void> {
    await BleClient.initialize();
    console.log('BLE initialized successfully');
  }

  /**
   * Performs the BLE scan with timeout handling
   */
  async #performBLEScan(silent?: boolean): Promise<void> {
    const scanTimeout = this.#createScanTimeout();
    const scanPromise = this.#createScanPromise(silent);

    try {
      await Promise.race([scanPromise, scanTimeout]);
    } catch (error) {
      console.error('Scan error:', error);
      if (this.#scanning) {
        await this.stopScan(silent);
        if (!silent && this.#devices.length === 0) {
          await this.#showTroubleConnectingBackdrop();
        }
      }
    }
  }

  /**
   * Creates a timeout promise for the scan operation
   */
  #createScanTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Reconnect: Scan timeout'));
      }, SCAN_TIMEOUT_MS);
    });
  }

  /**
   * Creates the main scan promise that handles device discovery
   */
  async #createScanPromise(silent?: boolean): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log('Requesting BLE scan...');
        await this.#startLEScan(resolve, reject, silent);
      } catch (error: any) {
        if (this.#isAlreadyScanningError(error)) {
          await this.#handleAlreadyScanningError(resolve, reject, silent);
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * Checks if the error is an "Already scanning" error
   */
  #isAlreadyScanningError(error: any): boolean {
    return error.message && error.message.includes('Already scanning');
  }

  /**
   * Handles the "Already scanning" error by stopping and retrying
   */
  async #handleAlreadyScanningError(
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void,
    silent?: boolean
  ): Promise<void> {
    console.log(
      'Received "Already scanning" error, stopping scan and retrying...'
    );
    try {
      await this.stopScan(silent);
      this.#scanning = false;
      setTimeout(async () => {
        try {
          console.log('Retrying BLE scan after "Already scanning" error...');
          await this.#startLEScan(resolve, reject, silent);
        } catch (retryError) {
          console.error('Error on retry scan:', retryError);
          reject(retryError);
        }
      }, 1000);
    } catch (stopError) {
      console.error('Error stopping scan before retry:', stopError);
      reject(stopError);
    }
  }

  /**
   * Handles scan results, filtering for Aria devices
   */
  async #handleScanResult(
    result: ScanResult,
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void,
    silent?: boolean
  ): Promise<void> {
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

        if (!this.#connected) {
          try {
            await this.connect(result, silent);
            if (this.#scanning) {
              await this.stopScan(silent);
            }
            resolve();
          } catch (error) {
            console.error('Error connecting to device:', error);
            reject(error);
          }
        }
      });
    }
  }

  /**
   * Starts the BLE scan with the appropriate options
   */
  async #startLEScan(
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void,
    silent?: boolean
  ): Promise<void> {
    await BleClient.requestLEScan(
      {
        allowDuplicates: false,
        namePrefix: ARIA_ADVERTISING_NAME,
      },
      async (result) => this.#handleScanResult(result, resolve, reject, silent)
    );
  }

  async connect(device: any, silent?: boolean): Promise<void> {
    console.log(
      'Reconnect: Attempting to connect to device:',
      device?.device?.name || 'unknown device',
      silent ? '(silent)' : ''
    );

    if (this.#connected) {
      console.log('Already connected, skipping connect');
      return;
    }

    if (this.#connectionInProgress) {
      console.log(
        'Connection was already in progress, resetting and trying again'
      );
      this.#connectionInProgress = false;
    }

    this.#connectionInProgress = true;

    try {
      const useMockDevice = await firstValueFrom(
        this.#store.select(getUseMockDevice)
      );
      if (useMockDevice) {
        this.#store.dispatch(new fromBluetoothStore.Connect(device));
        await this.#bluetoothMockDeviceProvider.connectToMockDevice(device);
        return;
      }

      this.#store.dispatch(new fromBluetoothStore.Connect(device));

      if (this.#isNativePlatform) {
        try {
          this.#device = device;
          await BleClient.connect(device.device.deviceId, () => {
            console.log('Device disconnected callback triggered');
            this.#store.dispatch(new fromBluetoothStore.Disconnect());
          });

          console.log('Connected to device successfully');

          this.#connected = true;
          this.#connectedSubject.next(true);
          this.#name = device.device.name || 'Unknown Device';
          this.#rssi = device.rssi || 0;

          this.#store.dispatch(
            new fromBluetoothStore.ConnectSuccess({
              name: this.#name,
              rssi: this.#rssi,
              battery: this.#battery,
              manufacturer: this.#manufacturer,
              model: this.#model,
              serial: this.#serial,
              softwareRevision: this.#softwareRevision,
              hardwareRevision: this.#hardwareRevision,
            })
          );

          await this.#initializeDeviceAfterConnection();
        } catch (error) {
          console.error('Error connecting to device:', error);
          this.#store.dispatch(new fromBluetoothStore.ConnectFailure(error));
          if (!silent) {
            await this.#showTroubleConnectingBackdrop();
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('Error in connect method:', error);
      this.#store.dispatch(new fromBluetoothStore.ConnectFailure(error));
      if (!silent) {
        await this.#showTroubleConnectingBackdrop();
      }
      throw error;
    } finally {
      this.#connectionInProgress = false;
    }
  }

  async #initializeDeviceAfterConnection(): Promise<void> {
    try {
      console.log('Initializing device after connection...');
      await this.#startDeviceStateNotifications();
      await this.#getDeviceData();
      await this.#getBatteryLevel();
      await this.#getDeviceState();
      console.log('Device initialization complete');
    } catch (error) {
      console.error('Device initialization error:', error);
      this.#store.dispatch(new fromBluetoothStore.Disconnect());
    }
  }

  async stop(): Promise<void> {
    console.log('Stopping device connection');

    if (this.#isNativePlatform && this.#device?.device?.deviceId) {
      try {
        await BleClient.disconnect(this.#device.device.deviceId);
        console.log('Device disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting device:', error);
        this.#store.dispatch(new fromBluetoothStore.DisconnectFailure(error));
      }
    }
    this.#connected = false;
    this.#connectedSubject.next(false);
    this.#devices = [];
  }

  stopScan = async (silent?: boolean): Promise<void> => {
    if (this.#isNativePlatform) {
      try {
        await BleClient.stopLEScan();
        console.log('Scan stopped successfully', silent ? '(silent)' : '');
      } catch (error) {
        console.error('Error stopping scan:', error);
      }
    }
    this.#scanning = false;
    if (silent) {
      this.#silentReconnectInProgress = false;
    }
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

        this.#store.dispatch(
          new fromBluetoothStore.UpdateDeviceInfo({
            manufacturer: this.#manufacturer,
            model: this.#model,
            serial: this.#serial,
            softwareRevision: this.#softwareRevision,
            hardwareRevision: this.#hardwareRevision,
          })
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
          new fromBluetoothStore.UpdateBatteryLevel(this.#battery)
        );
      } catch (error) {
        console.error('Error reading battery level:', error);
        return false;
      }
    }
    return true;
  }

  async #getDeviceState(): Promise<boolean> {
    if (this.#isNativePlatform) {
      try {
        const result_device_state = await BleClient.read(
          this.#device.device.deviceId,
          SERVICE_ARIA_DEVICE_STATUS,
          CHARACTERISTIC_DEVICE_STATE
        );
        const { high_byte, low_byte } =
          dataViewToHighLowBytes(result_device_state);
        this.#updateState(high_byte);
        this.#updateStateData(low_byte);
      } catch (error) {
        console.error('Error reading device state:', error);
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

            if (high_byte === DeviceStateCode.PoweringOff) {
              this.#store.dispatch(new fromBluetoothStore.Disconnect());
            }
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
    if (this.#isNativePlatform) {
      await BleClient.openAppSettings();
    }
  }

  // TODO: will be rewritten (maybe removed while we implemented actions)
  async isDeviceConnected(): Promise<boolean> {
    console.log(
      'isDeviceConnected - current state:',
      this.#connected,
      'connection in progress:',
      this.#connectionInProgress
    );

    if (this.#connected) {
      return true;
    }

    if (this.#connectionInProgress) {
      console.log('Connection already in progress, waiting for result');
      try {
        const result = await firstValueFrom(
          race(
            this.connected$.pipe(
              filter((connected) => connected),
              map(() => true)
            ),
            timer(SCAN_TIMEOUT_MS).pipe(map(() => false))
          )
        );
        return result;
      } catch (error) {
        console.error('Error waiting for connection:', error);
        return false;
      }
    }

    this.#connectionInProgress = true;

    try {
      const useMockDevice = await firstValueFrom(
        this.#store.select(getUseMockDevice)
      );
      if (useMockDevice) {
        console.log('Using mock device');
        await this.#bluetoothMockDeviceProvider.provideMockDevice();
        this.#connectionInProgress = false;
        this.#scanning = false;
        return true;
      }

      if (this.#devices.length > 0 && !this.#connected) {
        const connectToDevice = async (device: any) => {
          console.log(
            'Found devices but not connected, attempting to connect to:',
            device.device.name
          );

          await this.connect(device);
        };

        if (this.#device) {
          await connectToDevice(this.#device);
        } else {
          const closestDevice = this.#devices.sort(
            (a, b) => (b?.rssi || 0) - (a?.rssi || 0)
          )[0];
          await connectToDevice(closestDevice);
        }

        const connected = await firstValueFrom(
          race(
            this.connected$.pipe(
              filter((connected) => connected),
              map(() => true),
              tap(() => console.log('Reconnect: connected')),
              take(1)
            ),
            timer(SCAN_TIMEOUT_MS).pipe(
              map(() => false),
              tap(() => console.log('Reconnect: timeout'))
            )
          )
        );

        return connected;
      }

      if (!this.#scanning) {
        console.log('No devices found, starting scan...');
        this.#store.dispatch(new fromBluetoothStore.StartScan());
      }

      const connectionSuccess$ = this.connected$.pipe(
        filter((connected: boolean) => connected),
        map(() => true),
        take(1)
      );

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
      this.#store.dispatch(new fromBluetoothStore.ConnectFailure(error));
      await this.#showTroubleConnectingBackdrop();
      return false;
    } finally {
      this.#connectionInProgress = false;
    }
  }

  // TODO: will be rewritten (maybe removed when we implement related actions)
  async waitForDosingStart(continueDose?: boolean): Promise<boolean> {
    console.log('waitForDosingStart');

    if (!this.#connected) {
      console.log('Device not connected, attempting to connect...');
      try {
        const connected = await this.isDeviceConnected();
        if (!connected) {
          console.log('Failed to connect to device');
          // TODO: wait until dosing starts
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
        })
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

  // TODO: will be rewritten (maybe removed when we implement related actions)
  async checkDosing(): Promise<boolean> {
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

  #resetConnectionState(): void {
    this.#connected = false;
    this.#connectedSubject.next(false);
    this.#connectionInProgress = false;
    this.#devices = [];
    this.#scanning = false;
  }

  //--------------------------------------------------
  // UI Feedback Methods
  //--------------------------------------------------
  async #showTroubleConnectingBackdrop(): Promise<void> {
    const isSilentScan = await firstValueFrom(
      this.#store.select(fromBluetoothStore.getIsSilentScan)
    );

    if (isSilentScan) {
      console.log(
        'Skipping trouble connecting backdrop - silent scan or scan not running'
      );
      return;
    }

    if (this.#connected) {
      console.log('Already connected, skipping trouble connecting backdrop');
      return;
    }

    console.log('Showing trouble connecting backdrop');
    this.#store.dispatch(
      new fromSharedStore.BackdropShow({
        transition: 'move',
        header: true,
        showBackButton: false,
        template: `
        <div class="trouble-connecting-message">
          <h1 class="font-heading-1--bold">Trouble connecting?</h1>
          <img src="assets/images/dosing-trouble-connecting.svg">
          <p>The injector may need to be reset. <br>Use the power button to shut off and restart the Aria injector.</p>
          <p>This demo unit <strong>does not</strong> have a <br>needle nor drug substance.</p>
          <p>When the injector power lights are <br>on or pulsing, it’s ready to continue.</p>
        </div>
      `,
        buttons: [
          {
            label: 'Continue',
            action: async () => {
              console.log('Restarting bluetooth discovery');
              this.#store.dispatch(new fromSharedStore.BackdropHide());

              this.#resetConnectionState();
              this.#store.dispatch(new fromBluetoothStore.StartScan());
            },
          },
        ],
        onClose: async () => {
          this.#resetConnectionState();
          this.#store.dispatch(new fromBluetoothStore.StartScan());
        },
      })
    );
  }

  async #showDisconnectionTimeoutAlert(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.#store.dispatch(
        new fromSharedStore.AlertShow({
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
                  this.#resetConnectionState();
                  this.#store.dispatch(new fromBluetoothStore.StartScan());
                  this.#store.dispatch(new fromSharedStore.AlertHide());
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
  }

  async silentReconnect(): Promise<void> {
    console.log('Starting silent reconnect...');

    if (this.#silentReconnectInProgress) {
      console.log('Silent reconnect already in progress, skipping');
      return;
    }

    if (this.#connected) {
      console.log('Device already connected, skipping silent reconnect');
      return;
    }

    this.#store.dispatch(new fromBluetoothStore.StartScan({ silent: true }));
  }
}
