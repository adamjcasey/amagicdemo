import { Injectable, NgZone } from '@angular/core';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

const AUTOMAGIC_SERVICE =               'EDFEC62E-9910-0BAC-5241-D8BDA6932A2F';
const AUTOMAGIC_STATE_CHARACTERISTIC =  '5A87B4EF-3BFA-76A8-E642-92933C31434F';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  private uuid_: string = "";
  private rssi_: number = 0;
  private name_: string = "";
  private state_: number = 0;
  private battery_: number = 0;
  private dosage_: number = 0;
  private interval_id_:any;
  private peripheral_:any;

  // Variables for mocking
  private mock_state: number = 1;
  private mock_battery: number = 100;
  private mock_dosing: number = 0;

  private devices_: any;
  private advertisement_raw_: any;

  constructor(private ngZone: NgZone) {}

  //--------------------------------------------------
  // Properties
  //--------------------------------------------------

  get Devices(): any[] {
    return this.devices_;
  }

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

  get AdvertisementRaw(): string {
    return this.advertisement_raw_;
  }

  //--------------------------------------------------
  // Bluetooth Actions
  //--------------------------------------------------

  //--------------------------------------------------
  async checkPermissions() {
    console.log("bluetooth.service.ts checkPermissions");
    if (Capacitor.isNativePlatform()) {
      await BleClient.initialize();
      const isEnabled = await BleClient.isEnabled();
      if (isEnabled) {
        return 'granted';
      }
      else {
        return 'not-allowed';
      }
    }
    else {
      return 'granted';
    }
  }

  //--------------------------------------------------
  async scan() {

    if (Capacitor.isNativePlatform()){
        console.log("Is Native Capacitor bluetooth.service.ts scan");

        try {
            await BleClient.requestLEScan(
                { allowDuplicates: true },
                this.onDeviceDiscovered.bind(this)
            );
        }
        catch (error) {
            console.error('scan', error);
        }
    }
    else {
        // Not using an actual mobile device, therefore running on the browser
        // Mock this with fake found devices
        console.log("Is Not Native Capacitor: scan");

        let peripheral_mock_1 =
        {
            localName: "Something else",
            device: { name: "Something else", deviceId: "ecb16f02-e281-4128-aea9-6c552910f250" },
            rssi: -45,
        };
        let peripheral_mock_2 =
        {
            localName: "AutoMagic",
            device: { name: "AutoMagic", deviceId: "cec50777-de5a-4884-a6a1-b247efa53231" },
            rssi: -90
        };
        let peripheral_mock_3 =
        {
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

      console.log('Stopped reading and disconnected');
      clearInterval(this.interval_id_);
      if (Capacitor.isNativePlatform()) {
          await BleClient.disconnect( this.peripheral_.device.deviceId);
      }
  }

  //--------------------------------------------------
  // Bluetooth Callbacks
  //--------------------------------------------------

  //--------------------------------------------------
  async onDeviceDiscovered(peripheral: any) {
    if (((peripheral.localName == "AutoMagic") ||
         (peripheral.device.name == "AutoMagic"))
         && (peripheral.rssi > -60))
    {
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
            try
            {
                let data = 0;
                if (Capacitor.isNativePlatform())
                {
                    const reading = await BleClient.read(peripheral.device.deviceId, AUTOMAGIC_SERVICE, AUTOMAGIC_STATE_CHARACTERISTIC);
                    data = reading.getUint32(0);
                }
                else
                {
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

                this.state_ = (data & 0xFF);
                this.battery_ = ((data >> 8) & 0xFF);
                this.dosage_ = ((data >> 16) & 0xFF);

                console.log("State: " + this.state_ + " Battery: " + this.battery_ + " Dosing: " + this.dosage_);
          }
          catch (error)
          {
            console.error('Error in interval callback:', error);
          }
        }, intervalDuration);
    }
  }

  //--------------------------------------------------
  async isDeviceConnected() {
    if (Capacitor.isNativePlatform()) {
      return new Promise((resolve, reject) => {
        const controller = setInterval(() => {
          // logic to detect if the device is connected
        }, 500);
      });
    }
    else {
      // support for web, wait 10segs (duration of the dosing) to return a true;
      await new Promise(resolve => setTimeout(resolve, 3000));
      return true;
    }
  }

  //--------------------------------------------------
  async waitForDosingStart() {
    // start watching the press on the device
    if (Capacitor.isNativePlatform()) {
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

  //--------------------------------------------------
  async checkDosing() {
    if (Capacitor.isNativePlatform()) {
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
      await new Promise(resolve => setTimeout(resolve, 10000));
      return true;
    }
  }
}
