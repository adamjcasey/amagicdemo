import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

import * as fromStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedServices from '@shared/services';
import * as fromHomeStore from '@home/store';
import { GestureController } from '@shared/services/gestureController';

@Component({
  selector: 'automagic-layout',
  templateUrl: 'layout.page.html',
  styleUrls: ['layout.page.scss'],
})
export class LayoutPage implements OnInit {
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
  ) {
    this.config$ = this._store.select(fromStore.getLayoutConfig);
    this.backdropConfig$ = this._store.select(fromSharedStore.getBackdropConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
  }

  ngOnInit() {
    this.config$.subscribe(config => {
      if (config) {
        this.config = config;
        if (this.config.noDeviceModeBatteryLowFlow) {
          this.batteryLowMessageShowed = false;
        }

        if (this.config.isDeviceConnected) {
          this.verifyBatterLevelOfDevice();
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
        fromSharedServices.UtilsService.getParentByClass(event.target, 'backdrop__fold')
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

    if (Capacitor.isNativePlatform()) {
      this.getDeviceInfo();
    }
  }

  async verifyBatterLevelOfDevice() {
    if (this.config.debuggingDeviceMode) {
      this._bluetoothService.renderDebuggingVerboose('verifyBatterLevelOfDevice');
    }

    if (this.config.isDeviceConnected) {
      if (this.config.debuggingDeviceMode) {
        this._bluetoothService.renderDebuggingVerboose('verifyBatterLevelOfDevice ', 'The device is connected');
        setTimeout(() => {
          this._bluetoothService.renderDebuggingVerboose('verifyBatterLevelOfDevice ', `Current Battery Level: ${this._bluetoothService.Battery}`);
        }, 2000);
      }

      setInterval(() => {
        const batteryLevel = this._bluetoothService.Battery;
        if (batteryLevel < this.minBatteryLevel) {
          if (!this.backdropConfig.show && !this.batteryLowMessageShowed) {
            this.batteryLowMessageShowed = true;
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
              onClose: () => {
                if (this.config.noDeviceModeBatteryLowFlow) {
                  this._store.dispatch(new fromStore.SetNoDeviceModeBatteryLowFlow(false));
                  this._bluetoothService.Battery = 20;
                }
              }
            }));
          }
        }
      }, 5000);
    }
  }

  async getDeviceInfo() {
    try {
      this.deviceInfo = await Device.getInfo();
      this._store.dispatch(new fromStore.SetDeviceInfo({
        name: this.deviceInfo.name.toLowerCase().replaceAll(' ', '-'),
        model: this.deviceInfo.model.toLowerCase().replaceAll(' ', '-'),
      }));
    }
    catch(error: any) {
      console.log('getDeviceInfo > error: ', error)
    }
  }
}
