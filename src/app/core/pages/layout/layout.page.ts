import {
  AfterContentInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { App } from '@capacitor/app';
import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Store } from '@ngrx/store';
import {
  IOSOptions,
  IOSSettings,
  NativeSettings,
} from 'capacitor-native-settings';
import moment from 'moment';
// import { PowerMode } from 'power-mode';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AlertComponent,
  BottomToolbarComponent,
  TopBarComponent,
} from '@app/shared/components';
import { BluetoothService } from '@app/shared/libs/bluetooth';
import * as fromStore from '@core/store';
import * as fromHomeStore from '@home/store';
import { AlertController } from '@ionic/angular';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTabs,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import * as fromSharedServices from '@shared/services';
import { GestureController } from '@shared/services/gestureController';
import * as fromSharedStore from '@shared/store';
import { addIcons } from 'ionicons';
import { copyOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

enum CustomIOSSettings {
  Battery = 'battery',
}

type ExtendedIOSSettings = IOSSettings | CustomIOSSettings;

@Component({
  selector: 'automagic-layout',
  templateUrl: 'layout.page.html',
  styleUrls: ['layout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuToggle,
    IonButton,
    IonIcon,
    IonRouterOutlet,
    IonTabs,
    // fromStore.CoreStoreModule,
    TopBarComponent,
    AlertComponent,
    BottomToolbarComponent,
  ],
})
export class LayoutPage implements OnInit, AfterContentInit, OnDestroy {
  #utilsService = inject(fromSharedServices.UtilsService);

  public config$: Observable<any>;
  public config: any;
  public backdropConfig$: Observable<any>;
  public backdropConfig: any;
  public homeConfig$: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  // disable of showing low power notification by setting unrealistic minimum level value
  // and left dedicated logic and layout untouched to be able switch in on in future
  // or remove it fully later after final testing of this major release
  public minBatteryLevelDisabled: number = -1;
  public batteryLowMessageShowed: boolean = false;
  public deviceInfo: any;
  public lowPowerModeEnabled: boolean = false;

  constructor(
    private _store: Store<fromStore.LayoutState>,
    private _bluetoothService: BluetoothService,
    private _alertController: AlertController
  ) {
    this.config$ = this._store.select(fromStore.getLayoutConfig);
    this.backdropConfig$ = this._store.select(
      fromSharedStore.getBackdropConfig
    );
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);

    addIcons({ copyOutline });
  }

  ngOnInit() {
    this.config$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(async (config) => {
        if (config) {
          this.config = config;
          if (this.config.dosageDevice?.isConnected) {
            const batteryLevel = this.config.dosageDevice.battery;
            if (this.config.batteryLowAlertShownAt) {
              const lastDateShown = moment(this.config.batteryLowAlertShownAt);
              if (lastDateShown.diff(moment(), 'minutes') >= 30) {
                this._store.dispatch(
                  new fromStore.SetBatteryLowAlertShownAt(null)
                );
                if (batteryLevel < this.minBatteryLevelDisabled) {
                  if (!this.backdropConfig.show) {
                    this.showBatterLowAlert();
                  }
                }
              }
            } else {
              if (batteryLevel < this.minBatteryLevelDisabled) {
                if (!this.backdropConfig.show) {
                  this.showBatterLowAlert();
                }
              }
            }
          } else {
            if (this.config.noDeviceModeBatteryLowFlow) {
              if (this.backdropConfig.show) {
                this._store.dispatch(
                  new fromSharedStore.BackdropSetConfig({
                    onClose: () => {
                      this._bluetoothService.setBattery(5);
                      this.showBatterLowAlert();
                    },
                  })
                );
              }
            }
          }

          if (this.config.userDevice?.model) {
            const model = this.config.userDevice.model.replaceAll(/[a-z]/g, '');
            if (
              Number(model) <= 10.5 ||
              // iphone12,8 SE 2nd Generation
              this.config.userDevice.model === 'iphone12.8' ||
              // iphone14,6 SE 3rd Generation
              this.config.userDevice.model === 'iphone14.6'
            ) {
              const alert = await this._alertController.create({
                header: 'Your device is not supported',
                message:
                  'This application is designed for<br>iPhones with a 5.85” or larger display.<br><br>This unsupported device will not demonstrate the intended screen layout and user experience.',
                buttons: [
                  {
                    text: 'Ok',
                    role: 'cancel',
                  },
                  // {
                  //   text: 'Quit',
                  //   handler: () => {
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

    this.backdropConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((backdropConfig) => {
        if (backdropConfig) {
          this.backdropConfig = backdropConfig;

          /*if(Capacitor.isNativePlatform()){
              if(backdropConfig.show) {
                  this.statusBarSetStyle(Style.Dark);
              } else {
                  this.statusBarSetStyle(Style.Light);
              }
          }*/
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          if (
            !this.homeConfig.onBoardingDone &&
            this.homeConfig.allCompletedDoses
          ) {
            const completedTasks = this.homeConfig.onBoardingTasks.filter(
              (task: any) => task.completed
            ).length;
            this._store.dispatch(
              new fromSharedStore.TopbarPendingNotifications(
                this.homeConfig.onBoardingTasks.length - completedTasks
              )
            );
            if (completedTasks === 6) {
              this._store.dispatch(
                new fromSharedStore.AlertShow({
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
                        this._store.dispatch(new fromSharedStore.AlertHide());
                        this._store.dispatch(
                          new fromHomeStore.SetData({
                            onBoardingDone: true,
                          })
                        );
                      },
                    },
                  ],
                })
              );
            }
          }
        }
      });

    const gc = new (GestureController as any)();
    gc.on('up', (event: any) => {
      if (
        this.backdropConfig.show &&
        fromSharedServices.UtilsService.getParentByClass(
          event.target,
          'backdrop__fold'
        ) &&
        !this.backdropConfig.blockClose
      ) {
        this._store.dispatch(new fromSharedStore.BackdropHide());
      }
    });
    gc.on('down', (event: any) => {
      if (
        !this.backdropConfig.show &&
        fromSharedServices.UtilsService.getParentByClass(
          event.target,
          'backdrop__fold'
        )
      ) {
        this._store.dispatch(
          new fromSharedStore.BackdropShow({
            transition: 'move',
            header: true,
          })
        );
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
      };

      if (
        event.target.tagName !== 'INPUT' &&
        event.target.tagName !== 'ION-CHECKBOX' &&
        !event.target.classList.contains('hotspot-element') &&
        !event.target.classList.contains('body-shape') &&
        !fromSharedServices.UtilsService.getParentByClass(
          event.target,
          'hotspot-element'
        ) &&
        !fromSharedServices.UtilsService.getParentByClass(
          event.target,
          'rating-field'
        ) &&
        !fromSharedServices.UtilsService.getParentByClass(
          event.target,
          'add-photo-cta'
        ) &&
        !fromSharedServices.UtilsService.getParentByClass(
          event.target,
          'backdrop__fold'
        )
      ) {
        highlightElements();
      }
    });

    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        if (Capacitor.isNativePlatform()) {
          const storage: any = environment.db;
          const state = await storage.get('state');
          if (state) {
            this._store.dispatch(new fromStore.SetStore(JSON.parse(state)));
          }

          this.getDeviceInfo();
        } else {
          const state = localStorage.getItem('state');
          if (state) {
            this._store.dispatch(new fromStore.SetStore(JSON.parse(state)));
          }
        }
      }
    });
  }

  ngAfterContentInit() {
    this.getDeviceInfo();
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  async blockUsageInLowPowerMode() {
    // if (Capacitor.isNativePlatform()) {
    //   const lowPowerMode = await PowerMode.lowPowerModeEnabled();
    //   this.lowPowerModeEnabled = lowPowerMode.lowPowerModeEnabled;
    //   if (this.lowPowerModeEnabled) {
    //     this.showLowPowerModeAlert();
    //   }
    // }
  }

  showLowPowerModeAlert() {
    if (!this.backdropConfig.show) {
      this._store.dispatch(
        new fromSharedStore.BackdropShow({
          transition: 'move',
          fullScreen: true,
          header: false,
          contentCentered: true,
          showBackButton: false,
          blockClose: true,
          template: `
          <h1 class="font-heading-1--bold">This demo does <br>not support low <br>power mode.</h1>
          <img src="assets/images/low-power-mode.svg" />
          <p>Please disable low power mode in <br>your phone’s battery settings and <br>restart the app.</p>
          <br>
          <br>
        `,
          buttons: [
            {
              label: 'Go to settings',
              action: () => {
                NativeSettings.openIOS({
                  option: 'battery',
                } as IOSOptions & { option: ExtendedIOSSettings });
              },
            },
          ],
        })
      );
    }
  }

  showBatterLowAlert() {
    this._store.dispatch(
      new fromSharedStore.BackdropShow({
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
          this._store.dispatch(
            new fromStore.SetBatteryLowAlertShownAt(moment().toDate())
          );
          // if (this.config.noDeviceModeBatteryLowFlow) {
          this._store.dispatch(
            new fromStore.SetNoDeviceModeBatteryLowFlow(false)
          );
          this._bluetoothService.setBattery(20);
          // }
        },
      })
    );
  }

  async getDeviceInfo() {
    if (Capacitor.isNativePlatform()) {
      try {
        this.deviceInfo = await Device.getInfo();
        this._store.dispatch(
          new fromStore.SetUserDeviceInfo({
            name: this.deviceInfo.name.toLowerCase().replaceAll(' ', '-'),
            model: this.deviceInfo.model
              .toLowerCase()
              .replaceAll(' ', '-')
              .replaceAll(',', '.'),
          })
        );
      } catch (error: any) {
        console.log('getDeviceInfo > error: ', error);
      }
    }
  }

  getModelDeviceNumber(model: any) {
    model = model.replaceAll(/[a-z]/g, '');
    return parseFloat(model);
  }

  async copyDebuggingLogs() {
    const logs = document.getElementById(
      'device-debugging-logs'
    ) as HTMLElement;
    await Clipboard.write({
      string: logs.innerHTML,
    });
  }

  private statusBarSetStyle(style: Style): void {
    StatusBar.setStyle({ style });
  }
}
