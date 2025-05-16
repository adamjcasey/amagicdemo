import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { PushNotifications } from '@capacitor/push-notifications';
import { Store } from '@ngrx/store';
import { filter, Observable, take, takeUntil, timeout } from 'rxjs';

import { CommonModule } from '@angular/common';
import * as fromCoreStore from '@core/store';
import { IonContent, IonImg } from '@ionic/angular/standalone';
import { DeviceConnectionAbstract } from '@shared/abstracts/device-connection.abstract';
import * as fromSharedComponents from '@shared/components';
import * as fromBluetoothStore from '@shared/libs/bluetooth/store';
import * as fromSharedStore from '@shared/store';
import * as fromStore from '../store';

@Component({
  selector: 'automagic-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    fromSharedComponents.SliderPageComponent,
    IonContent,
    IonImg,
  ],
})
export class WelcomePage
  extends DeviceConnectionAbstract
  implements OnInit, AfterViewInit, OnDestroy
{
  private _store = inject(Store<fromCoreStore.CoreState>);
  private _formBuilder = inject(FormBuilder);

  public config$: Observable<any> = this._store.select(
    fromStore.getWelcomeConfig
  );
  public config: any;
  public backdropConfig$: Observable<any> = this._store.select(
    fromSharedStore.getBackdropConfig
  );
  public backdropConfig: any;
  public welcomeFormGroup: FormGroup = this._formBuilder.group({
    pin: ['', [Validators.required, Validators.minLength(4)]],
    name: ['', [Validators.required]],
    doses: ['', [Validators.required]],
  });
  public slides: Array<any> = [
    {
      header: {
        color: '--color-bg-pastel-green',
        asset: '/assets/images/welcome-step-1.svg',
      },
      content: {
        hideNavigation: true,
        template: `
          <h1 class="font-heading-1--bold">Welcome to <br>AutoMagic for Theryx.</h1>
          <p>The AutoMagic connected ecosystem empowers you to make the most of your Theryx prescription</p>
        `,
        actions: [
          {
            label: 'Get started',
            action: () => {
              this.sliderPage.slideNext();
            },
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-green',
        asset: '/assets/images/welcome-step-1.svg',
      },
      content: {
        template: `
          <h1 class="font-heading-1--bold">Let's get to know each other.</h1>
        `,
        form: {
          group: this.welcomeFormGroup,
          fields: [
            {
              label: "What's your name?",
              name: 'name',
              placeholder: 'Name',
              onInput: (event: any) => {
                const value = event.target.value;
                const capitalized = value.charAt(0).toUpperCase() + value.slice(1);

                this.welcomeFormGroup.get('name')?.setValue(capitalized, {
                  emitEvent: false,
                });

                this._store.dispatch(
                  new fromStore.SetData({
                    name: capitalized,
                  })
                );
              },
              onKeyDown: (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  this.handleNameContinue();
                }
              },
            },
          ],
        },
        actions: [
          {
            label: 'Continue',
            action: () => this.handleNameContinue(),
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-blue',
        asset: '/assets/images/welcome-step-2.svg',
      },
      content: {
        hideNavigation: null,
        template: `
          <h1 class="font-heading-1--bold">Let's get connected.</h1>
          <p>To get the most out of your connected autoinjector and enable dose tracking and help with your injection experience, please enable bluetooth.</p>
        `,
        actions: [
          {
            label: 'Allow Bluetooth',
            action: () => {
              this.allowBluetooth();
            },
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-blue',
        asset: '/assets/images/welcome-step-2.svg',
      },
      content: {
        hideNavigation: null,
        template: `
          <h1 class="font-heading-1--bold">This experience requires bluetooth</h1>
          <p>You'll need to allow Bluetooth for AutoMagic in your settings to continue this app experience.</p>
        `,
        actions: [
          {
            label: 'Open Settings to Allow Bluetooth',
            action: () => {
              this._store.dispatch(new fromBluetoothStore.OpenSettings());
              this.sliderPage.slideNext();
            },
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-green-dark',
        asset: '/assets/images/welcome-step-2-2.svg',
      },
      content: {
        hideNavigation: null,
        template: `
          <h1 class="font-heading-1--bold">Let's connect your Aria Autoinjector.</h1>
          <p>Power on the Aria Autoinjector.</p>
          <p>The light above the power button should blink to indicate the power is on and ready to pair.</p>
        `,
        actions: [
          {
            label: 'Connect Now',
            action: () => {
              this.connectToDevice();
            },
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-green-dark',
        asset: '/assets/images/welcome-step-2-3.svg',
      },
      content: {
        hideNavigation: null,
        template: `
          <h1 class="font-heading-1--bold">Connecting...</h1>
          <p>Searching for Aria Autoinjectors...</p>
          <p>Ensure that your Aria is powered on and in range while pairing.</p>
          <div class="loader"></div>
        `,
        actions: [],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-green-dark',
        asset: '/assets/images/welcome-step-2-4.svg',
      },
      content: {
        hideNavigation: null,
        template: `
          <h1 class="font-heading-1--bold">Connected!</h1>
          <p>Your Aria Autoinjector is now connected to your phone.</p>
          <p>You're ready to proceed to the next step.</p>
        `,
        actions: [
          {
            label: 'Continue',
            action: () => {
              this._store.dispatch(
                new fromStore.SetData({
                  bleAllowed: true,
                  bleConnected: true,
                })
              );
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor(
                  '--color-bg-pastel-honey-yellow'
                )
              );
              this.sliderPage.slideNext();
            },
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-honey-yellow',
        asset: '/assets/images/welcome-step-3.svg',
      },
      content: {
        template: `
          <h1 class="font-heading-1--bold">Allow Notifications.</h1>
          <p>To help you remember your dose schedule and know when medication is at the right temperature, please <strong>enable notifications.</strong> You can customize notifications in the Settings menu.</p>
        `,
        actions: [
          {
            label: 'Allow Notifications',
            action: () => {
              this.allowNotifications();
            },
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-lime',
        asset: '/assets/images/welcome-step-4.svg',
      },
      content: {
        template: `
          <h1 class="font-heading-1--bold">You're ready to rock!</h1>
          <p>The AutoMagic app is configured to harness the power of the AutoMagic autoinjector.</p>
        `,
        actions: [
          {
            label: 'Previous',
            action: () => {
              this.sliderPage.slidePrev();
              this.showDosesSelector();
            },
          },
          {
            label: 'Continue',
            action: () => {
              this._store.dispatch(new fromSharedStore.SliderPageClear());
              this._store.dispatch(new fromCoreStore.SetWelcomeFlowAsDone());
              this.goTo('home');
            },
          },
        ],
      },
    },
  ];

  handleNameContinue() {
    if (this.welcomeFormGroup.get('name')?.valid) {
      this._store.dispatch(
        new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue')
      );
      this.sliderPage.slideNext();
    } else {
      this.welcomeFormGroup.get('name')?.markAllAsTouched();
    }
  }

  @ViewChild('videoWrapper') videoWrapper!: ElementRef;
  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;

  private isConnected$: Observable<boolean> = this._store.select(
    fromBluetoothStore.getIsConnected
  );
  private devices$: Observable<any[]> = this._store.select(
    fromBluetoothStore.getDevices
  );
  private isConnected: boolean = false;

  constructor() {
    super({ waitForDeviceConnection: true });

    Keyboard.addListener('keyboardDidShow', () => {
      const content = document.querySelector('ion-content');
      if (content) {
        content.scrollToBottom(300);
      }
    });
  }

  ngOnInit() {
    this.config$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((config: any) => {
        this.config = config;

        if (config && config.doses) {
          this.welcomeFormGroup.get('doses')?.setValue(config.doses);
        }
      });

    this.backdropConfig$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((backdropConfig: any) => {
        this.backdropConfig = backdropConfig;
      });

    this.isConnected$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isConnected) => {
        this.isConnected = isConnected;
      });

    this.setupConnectionMonitoring();
  }

  async ngAfterViewInit() {
    this.playIntroAnimation();
  }

  playIntroAnimation() {
    this._store.dispatch(new fromCoreStore.SetFullScreen(true));

    const showWelcomeScreen = () => {
      this._store.dispatch(new fromCoreStore.SetFullScreen(false));

      setTimeout(() => {
        this.videoWrapper.nativeElement.classList.add('is-ended');
      }, 400);
    };

    const welcomeGifDuration = 3250;

    setTimeout(() => {
      showWelcomeScreen();
    }, welcomeGifDuration);
  }

  slideNext(sliders: any) {
    const currentSlide = sliders.content.activeIndex;
    if (currentSlide === 1) {
      sliders.asset.slideTo(2);
    } else {
      sliders.asset.slideNext(500);
    }

    sliders.content.slideNext(500);
  }

  async allowBluetooth() {
    if (this.config.bleAllowed) {
      this._store.dispatch(
        new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green-dark')
      );
      this.sliderPage.slideTo(4);
    } else {
      try {
        this._store.dispatch(new fromBluetoothStore.CheckPermissions());

        // Wait for the permissions result from the store
        const permissionsStatus = await new Promise<'granted' | 'not-allowed'>(
          (resolve) => {
            this._store
              .select(fromBluetoothStore.getPermissionsStatus)
              .pipe(
                filter((status) => status !== 'unknown'),
                take(1)
              )
              .subscribe((status) => {
                resolve(status as 'granted' | 'not-allowed');
              });
          }
        );

        if (permissionsStatus === 'granted') {
          this._store.dispatch(
            new fromStore.SetData({
              bleAllowed: true,
            })
          );

          this._store.dispatch(
            new fromSharedStore.TopbarChangeColor(
              '--color-bg-pastel-green-dark'
            )
          );
          this.sliderPage.slideTo(4);
        } else {
          this._store.dispatch(
            new fromStore.SetData({
              bleAllowed: false,
            })
          );
          this.sliderPage.slideNext();
        }
      } catch (error) {
        this._store.dispatch(
          new fromSharedStore.SliderPageSetContentOptions({
            actions: [
              {
                label: 'Open Settings to Allow Bluetooth',
                action: () => {
                  this._store.dispatch(new fromBluetoothStore.OpenSettings());
                  this.sliderPage.slideNext();

                  this._store.dispatch(
                    new fromStore.SetData({
                      bleAllowed: true,
                    })
                  );

                  this._store.dispatch(
                    new fromBluetoothStore.PermissionsResult('granted')
                  );
                },
              },
            ],
          })
        );
      }
    }
  }

  async connectToDevice() {
    console.log('Connecting to device...');

    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green-dark')
    );
    this.sliderPage.slideNext();

    try {
      // Start scanning for devices
      this._store.dispatch(new fromBluetoothStore.StartScan());

      const connected = await new Promise<boolean>((resolve) => {
        console.log('Setting up connection monitoring...');

        const subscription = this.isConnected$
          .pipe(
            filter((isConnected) => isConnected),
            take(1)
          )
          .subscribe({
            next: () => {
              console.log('Connection detected in subscription');
              subscription.unsubscribe();
              resolve(true);
            },
            error: (err) => {
              console.error('Connection subscription error:', err);
              subscription.unsubscribe();
              resolve(false);
            },
          });

        const devicesSubscription = this.devices$
          .pipe(
            filter((devices) => devices && devices.length > 0),
            take(1),
            timeout(10000)
          )
          .subscribe({
            next: (devices) => {
              console.log('Devices found:', devices);
              // Connect to the first device found
              if (devices.length > 0 && !this.isConnected) {
                console.log(
                  'Attempting to connect to found device:',
                  devices[0]
                );
                this._store.dispatch(new fromBluetoothStore.Connect());
              }
              devicesSubscription.unsubscribe();
            },
            error: () => {
              devicesSubscription.unsubscribe();
            },
          });
      });

      if (connected) {
        console.log('Successfully connected to device, moving to next slide');

        this._store.dispatch(
          new fromStore.SetData({
            bleAllowed: true,
            bleConnected: true,
          })
        );

        this._store.dispatch(
          new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green-dark')
        );

        setTimeout(() => {
          this.sliderPage.slideNext();
        }, 500);
      } else {
        console.log('Failed to connect to device or timeout occurred');
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  }

  setupConnectionMonitoring() {
    this.isConnected$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((connected) => {
        console.log('Connection state changed:', connected);

        if (
          connected &&
          this.sliderPage &&
          this.sliderPage.currentSlide === 3
        ) {
          console.log('Auto-advancing to next slide due to connection');

          this._store.dispatch(
            new fromStore.SetData({
              bleAllowed: true,
              bleConnected: true,
            })
          );

          setTimeout(() => {
            this.sliderPage.slideNext();
          }, 500);
        }
      });
  }

  async allowNotifications() {
    if (this.config.notificationsAllowed) {
      this.showDosesSelector();
    } else {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
        let permissionStatus = await PushNotifications.checkPermissions();

        if (permissionStatus.receive === 'prompt') {
          permissionStatus = await PushNotifications.requestPermissions();
        }

        if (permissionStatus.receive !== 'granted') {
          this._store.dispatch(
            new fromStore.SetData({
              notificationsAllowed: false,
            })
          );
          this.showDosesSelector();
        }

        if (permissionStatus.receive === 'granted') {
          this._store.dispatch(
            new fromStore.SetData({
              notificationsAllowed: true,
            })
          );
          this.showDosesSelector();
        }

        await PushNotifications.register();
      } else {
        this.showDosesSelector();
      }
    }
  }

  showDosesSelector() {
    this.sliderPage.slideNext();
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-white')
    );
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContent({
        isExpanded: true,
        template: `
        <h1 class="font-heading-1--bold">Confirm your dosing schedule.</h1>
        <p>Typical dosing for Theryx®:<br> 1 weekly for the first 4 weeks,<br> Every 2 weeks afterwards</p>
      `,
        component: 'welcome-doses-selector',
        toolbar: {
          template: `
          <p><strong>6 doses</strong> are preselected</p>
        `,
          actions: [
            {
              label: 'Previous',
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-honey-yellow'
                  )
                );
                this._store.dispatch(
                  new fromSharedStore.SliderPageSetContent({
                    isExpanded: false,
                    template: `
                    <h1 class="font-heading-1--bold">Allow Notifications.</h1>
                    <p>To help you remember your dose schedule and know when medication is at the right temperature, please <strong>enable notifications.</strong> You can customize notifications in the Settings menu.</p>
                  `,
                    actions: [
                      {
                        label: 'Allow Notifications',
                        action: () => {
                          this.allowNotifications();
                        },
                      },
                    ],
                  })
                );
              },
            },
            {
              label: 'Proceed',
              action: () => {
                if (this.welcomeFormGroup.get('doses')?.valid) {
                  this._store.dispatch(
                    new fromSharedStore.SliderPageSetContent({
                      isExpanded: false,
                    })
                  );
                  this._store.dispatch(
                    new fromSharedStore.TopbarChangeColor(
                      '--color-bg-pastel-lime'
                    )
                  );
                  this.sliderPage.slideNext();
                }
              },
            },
          ],
        },
      })
    );
  }
}
