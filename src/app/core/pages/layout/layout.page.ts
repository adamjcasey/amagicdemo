import { AfterContentInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Clipboard } from '@capacitor/clipboard';
import * as moment from 'moment';

import * as fromStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedServices from '@shared/services';
import * as fromHomeStore from '@home/store';
import { GestureController } from '@shared/services/gestureController';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'automagic-layout',
  templateUrl: 'layout.page.html',
  styleUrls: ['layout.page.scss'],
})
export class LayoutPage implements OnInit, AfterContentInit {
  public config$: Observable<any>;
  public config: any;
  public backdropConfig$: Observable<any>;
  public backdropConfig: any;
  public homeConfig$: Observable<any>;
  public homeConfig: any;
  public minBatteryLevel: number = 5;
  public batteryLowMessageShowed: boolean = false;
  public deviceInfo: any;

  constructor(
    private _store: Store<fromStore.LayoutState>,
    private _bluetoothService: fromSharedServices.BluetoothService,
    private _alertController: AlertController,
  ) {
    this.config$ = this._store.select(fromStore.getLayoutConfig);
    this.backdropConfig$ = this._store.select(fromSharedStore.getBackdropConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
  }

  ngOnInit() {
    this.config$.subscribe(async config => {
      if (config) {
        this.config = config;
        if (this.config.dosageDevice.isConnected) {
          const batteryLevel = this.config.dosageDevice.battery;
          if (this.config.batteryLowAlertShownAt) {
            const lastDateShown = moment(this.config.batteryLowAlertShownAt);
            if (lastDateShown.diff(moment(), 'minutes') >= 30) {
              this._store.dispatch(new fromStore.SetBatteryLowAlertShownAt(null));
              if (batteryLevel < this.minBatteryLevel) {
                if (!this.backdropConfig.show) {
                  this.showBatterLowAlert();
                }
              }
            }
          }
          else {
            if (batteryLevel < this.minBatteryLevel) {
              if (!this.backdropConfig.show) {
                this.showBatterLowAlert();
              }            
            }
          }
        }
        else {
          if (this.config.noDeviceModeBatteryLowFlow) {
            if (this.backdropConfig.show) {
              this._store.dispatch(new fromSharedStore.BackdropSetConfig({
                onClose: () => {
                  this._bluetoothService.setBattery(5);
                  this.showBatterLowAlert();
                },
              }));
            }
          }
        }

        if (this.config.userDevice?.model) {
          const model = this.config.userDevice.model.replaceAll(/[a-z]/g, '');
          console.log('model ', Number(model));
          console.log('is minor than 10.5 ', Number(model) <= 10.5);
          console.log('modelSaved ', this.config.userDevice.model);
          console.log('condition 1', this.config.userDevice.model === 'iphone12.8');
          console.log('condition 2', this.config.userDevice.model === 'iphone14.6');
          if (
            Number(model) <= 10.5 || 
            // iphone12,8 SE 2nd Generation
            this.config.userDevice.model === 'iphone12.8' || 
            // iphone14,6 SE 3rd Generation
            this.config.userDevice.model === 'iphone14.6'
          ) {
            console.log('ENTRA!!');
            const alert = await this._alertController.create({
              header: 'Your device is not supported',
              message: 'This application is designed for<br>iPhones with a 5.85” or larger display.<br><br>This unsupported device will not demonstrate the intended screen layout and user experience.',
              buttons: [
                {
                  text: 'Ok',
                  role: 'cancel',
                },
                // {
                //   text: 'Quit',
                //   handler: () => {
                //     console.log('quit');
                //     App.exitApp();
                //   },
                // }
              ],
            });
            await alert.present();
          }
        }
      }
    });

    this.backdropConfig$.subscribe(backdropConfig => {
      if (backdropConfig) {
        this.backdropConfig = backdropConfig;
      }
    });

    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
        if (!this.homeConfig.onBoardingDone && this.homeConfig.allCompletedDoses) {
          const completedTasks = this.homeConfig.onBoardingTasks.filter((task: any) => task.completed).length;
          this._store.dispatch(new fromSharedStore.TopbarPendingNotifications(this.homeConfig.onBoardingTasks.length - completedTasks));
          if (completedTasks === 6) {
            this._store.dispatch(new fromSharedStore.AlertShow({
              mode: 'full',
              template: `
                <img src="assets/images/on-boarding-done.svg" />
                <h1 class="font-heading-1--bold">Onboarding complete!</h1>
                <p>Way to go! You’ve finished all of your onboarding tasks.</p>
              `,
              actions: [
                {
                  label: 'Got it',
                  fill: 'outline',
                  action: () => { 
                    this._store.dispatch(new fromSharedStore.AlertHide);
                    this._store.dispatch(new fromHomeStore.SetData({
                      onBoardingDone: true,
                    }));
                  },
                }
              ]
            }));
          }
        }
      }
    });

    const gc = new (GestureController as any)();
    gc.on('up', (event: any) => {
      if (
        this.backdropConfig.show && 
        fromSharedServices.UtilsService.getParentByClass(event.target, 'backdrop__fold') &&
        !this.backdropConfig.blockClose
      ) {
        this._store.dispatch(new fromSharedStore.BackdropHide);
      }
    });
    gc.on('down', (event: any) => {
      if (
        !this.backdropConfig.show && 
        fromSharedServices.UtilsService.getParentByClass(event.target, 'backdrop__fold')
      ) {
        this._store.dispatch(new fromSharedStore.BackdropShow({
          transition: 'move',
          header: true,
        }));
      }
    });
    gc.on('tap', (event: any) => {
      const elementsToHighligh = document.querySelectorAll('.hotspot-element');
      const highlightElements = () => {
        Array.from(elementsToHighligh).forEach((element: any) => {
          if (!element.classList.contains('hotspot-element--cancel')) {
            element.classList.add('is-highlighted');
          }
        });

        setTimeout(() => {
          Array.from(elementsToHighligh).forEach((element: any) => {
            if (element.classList.contains('is-highlighted')) {
              element.classList.remove('is-highlighted');
            }
          });
        }, 1200);
      }

      if (
        event.target.tagName !== 'INPUT' &&
        event.target.tagName !== 'ION-CHECKBOX' && 
        !event.target.classList.contains('hotspot-element') && 
        !event.target.classList.contains('body-shape') &&
        !fromSharedServices.UtilsService.getParentByClass(event.target, 'hotspot-element') &&
        !fromSharedServices.UtilsService.getParentByClass(event.target, 'rating-field') &&
        !fromSharedServices.UtilsService.getParentByClass(event.target, 'add-photo-cta') && 
        !fromSharedServices.UtilsService.getParentByClass(event.target, 'backdrop__fold')
      ) {
        highlightElements();
      }
    });
  }

  ngAfterContentInit() {
    if (Capacitor.isNativePlatform()) {
      this.getDeviceInfo();
    }
  }

  showBatterLowAlert() {
    this._store.dispatch(new fromSharedStore.BackdropShow({
      transition: 'move',
      header: true,
      template: `
        <br>
        <img src="assets/images/battery-low.svg" />
        <h1 class="font-heading-1--bold">Injector battery <br>low</h1>
        <p>Unfortunately the demo injector has <br>a low battery and must be <br>recharged.</p>
        <h5>Please follow the recharge <br>instructions included with the <br>USB-C cord in the shipping box.</h5>
      `,
      onClose: async () => {
        this._store.dispatch(new fromStore.SetBatteryLowAlertShownAt(moment().toDate()));
        if (this.config.noDeviceModeBatteryLowFlow) {
          this._store.dispatch(new fromStore.SetNoDeviceModeBatteryLowFlow(false));
          this._bluetoothService.setBattery(20);
        }
      }
    }));
  }

  async getDeviceInfo() {
    console.log('getDeviceInfo');
    try {
      this.deviceInfo = await Device.getInfo();
      console.log('deviceInfo ', this.deviceInfo);
      this._store.dispatch(new fromStore.SetUserDeviceInfo({
        name: this.deviceInfo.name.toLowerCase().replaceAll(' ', '-'),
        model: this.deviceInfo.model.toLowerCase().replaceAll(' ', '-').replaceAll(',', '.'),
      }));
    }
    catch(error: any) {
      console.log('getDeviceInfo > error: ', error)
    }
  }

  getModelDeviceNumber(model: any) {
    model = model.replaceAll(/[a-z]/g, '');
    return parseFloat(model);
  }

  async copyDebuggingLogs() {
    const logs = document.getElementById('device-debugging-logs') as HTMLElement;
    await Clipboard.write({
      string: logs.innerHTML
    });
  }
}
