import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

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
        if (!this.homeConfig.onBoardingDone) {
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
    
    const gc = new (GestureController as any)(document.body);
    gc.on('up', () => {
      if (this.backdropConfig.show) {
        this._store.dispatch(new fromSharedStore.BackdropHide);
      }
    });
    gc.on('down', (event: any) => {
      if (!this.backdropConfig.show) {
        this._store.dispatch(new fromSharedStore.BackdropShow({
          transition: 'move',
          header: true,
        }));
      }
    });

    // gc.on('left', d => alert('swiped left'));
    // gc.on('right', d => alert('swiped right'));

    this.verifyBatterLevelOfDevice();
  }

  async verifyBatterLevelOfDevice() {
    try {
      const isDeviceConnected = await this._bluetoothService.isDeviceConnected();
      if (isDeviceConnected) {
        setInterval(() => {
          const batteryLevel = this._bluetoothService.Battery;
          if (batteryLevel < 10) {
            this._store.dispatch(new fromSharedStore.BackdropShow({
              transition: 'move',
              header: true,
              template: `
                <br>
                <img src="assets/images/battery-low.svg" />
                <h1 class="font-heading-1--bold">Injector battery <br>low</h1>
                <p>Unfortunately the demo injector has <br>a low battery and must be <br>recharged.</p>
                <h5>Please follow the recharge <br>instructions included with the <br>USB-C cord in the shipping box.</h5>
              `
            }));
          }
        }, 60000);
      }
    }
    catch (error) {
      console.log('verifyBatterLevelOfDevice > error: ', error);
    }
  }
}
