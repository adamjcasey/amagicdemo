import { Injectable, NgZone } from '@angular/core';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  private devices_: ScanResult[] = [];
  private uuid_: string = "";
  private rssi_: number = 0;
  private name_: string = "";
  private state_: number = 0;
  private battery_: number = 0;
  private dosage_: number = 0;
  private advertisement_raw_: string = "";

  constructor(private ngZone: NgZone) { }

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

  //--------------------------------------------------
  async scan() {
    console.log("bluetooth.service.ts scan");

    this.devices_ = [];  // clear list

    if (Capacitor.isNativePlatform()) {
      console.log("Is Native Capacitor");

      try {
        await BleClient.initialize();
        await BleClient.requestLEScan(
          { allowDuplicates: true },
          this.onDeviceDiscovered.bind(this)
        );
      }
      catch (error) {
        console.error('scanForBluetoothDevices', error);
      }
    }

  }

  //--------------------------------------------------
  async stopScan() {
    await BleClient.stopLEScan();
    console.log('stopped scanning');
  }

  //--------------------------------------------------
  // Bluetooth Callbacks
  //--------------------------------------------------

  //--------------------------------------------------
  onDeviceDiscovered(peripheral: any) {
    if ((peripheral.localName == "AutoMagic") || (peripheral.device.name == "AutoMagic")) {
      this.ngZone.run(() => {
        console.log("AutoMagic Discovered: ");
        console.log(peripheral);
        this.name_ = peripheral.device.name;
        console.log("Name: " + this.name_);
        this.rssi_ = peripheral.rssi;
        console.log("RSSI: " + this.rssi_);
        this.uuid_ = peripheral.device.deviceId;
        console.log("UUID: " + this.uuid_);
        this.state_ = peripheral.manufacturerData[0].getUint8(0);
        console.log("State: " + this.state_);
        this.battery_ = peripheral.manufacturerData[0].getUint8(1);
        console.log("Battery: " + this.battery_);
        this.dosage_ = peripheral.manufacturerData[0].getUint8(2);
        console.log("Dosage: " + this.dosage_);
        let manufacturerData = [];
        for (let i = 0; i < 3; i++)
          manufacturerData[i] = peripheral.manufacturerData[0].getUint8(i).toString(16).padStart(2, '0');
        this.advertisement_raw_ = manufacturerData[0] + " " + manufacturerData[1] + " " + manufacturerData[2];
      });
    }
  }
}
