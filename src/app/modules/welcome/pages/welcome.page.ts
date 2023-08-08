import {
  Component,
  ViewEncapsulation,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

import * as fromStore from '../store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedComponents from '@shared/components';
import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-welcome',
  templateUrl: 'welcome.page.html',
  styleUrls: ['welcome.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomePage implements OnInit, AfterViewInit, OnDestroy {
  public config$: Observable<any>;
  public config: any;
  public videoPlayer: any;
  public slides: Array<any> = [];
  public welcomeFormGroup: FormGroup;
  @ViewChild('videoWrapper') videoWrapper!: ElementRef;
  @ViewChild('videoTag') videoTag!: ElementRef;
  @ViewChild('sliderPage', { static: false }) sliderPage!: fromSharedComponents.SliderPageComponent;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder,
    private _bluetoothService: fromSharedServices.BluetoothService,
  ) {
    this.config$ = this._store.select(fromStore.getWelcomeConfig);
    this.welcomeFormGroup = this._formBuilder.group({
      pin: ['', [ Validators.required, Validators.minLength(4) ]],
      name: ['', [ Validators.required ]],
      doses: ['', [ Validators.required ]],
    });

    this.slides = [
      {
        header: {
          color: '--color-bg-pastel-green',
          asset: '/assets/images/welcome-step-1.svg',
        },
        content: {
          hideNavigation: true,
          template: `
            <h1 class="font-heading-1--bold">Welcome to AutoMagic for Theryx.</h1>
            <p>The AutoMagic connected ecosystem empowers you to make the most of your Theryx prescription</p>
          `,
          actions: [
            {
              label: 'Get started',
              action: () => { this.sliderPage.slideNext() }
            }
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
            <h1 class="font-heading-1--bold">Let’s get to know each other.</h1>
          `,
          form: {
            group: this.welcomeFormGroup,
            fields: [
              {
                label: 'What’s your name?',
                name: 'name',
                placeholder: 'Name',
                onInput: (event: any) => {
                  this._store.dispatch(new fromStore.SetData({
                    name: event.target.value
                  }));
                },
              }
            ],
          },
          actions: [
            {
              label: 'Continue',
              action: () => {
                if (this.welcomeFormGroup.get('name')?.valid) {
                  this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue'));
                  this.sliderPage.slideNext();
                }
                else {
                  this.welcomeFormGroup.get('name')?.markAllAsTouched();
                }
              }
            }
          ],
        },
      },
      {
        header: {
          color: '--color-bg-pastel-blue',
          asset: '/assets/images/welcome-step-2.svg',
        },
        content: {
          template: `
            <h1 class="font-heading-1--bold">Let's get connected.</h1>
            <p>To get the most out of your connected autoinjector and enable dose tracking and help with your injection experience, please enable bluetooth.</p>
          `,
          actions: [
            {
              label: 'Allow Bluetooth',
              action: () => { this.allowBluetooth() }
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
              action: () => { this.allowNotifications() }
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
                this.showDosesSelector();
                this.sliderPage.slidePrev();
              }
            },
            {
              label: 'Continue',
              action: () => {
                this._store.dispatch(new fromSharedStore.SliderPageClear());
                this.goTo('home');
              }
            }
          ],
        },
      },
    ];
  }

  ngOnInit() {
    this.config$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(config => {
        if (config) {
          this.config = config;
          if (this.config?.doses.length > 0) {
            this.welcomeFormGroup.patchValue({
              doses: this.config.doses
            });
          }
        }
      });
  }

  ngAfterViewInit() {
    this.playVideoIntro();
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  playVideoIntro() {
    // set full screen option for global layout
    this._store.dispatch(new fromCoreStore.SetFullScreen(true));
    const endHandler = () => {
      // turn off full screen option for global layout
      this._store.dispatch(new fromCoreStore.SetFullScreen(false));
      // show pin asking screen
      this._store.dispatch(new fromSharedStore.BackdropShow({
        transition: 'fade',
        fullScreen: true,
        header: false,
        contentCentered: true,
        showBackButton: false,
        blockClosing: true,
        component: 'welcome-sign-up',
      }));

      // holding a moment to hide the video and do match with the opening of Backdrop
      setTimeout(() => {
        this.videoWrapper.nativeElement.classList.add('is-ended');
      }, 400);
    };

    // setup and playing the video
    const videoElement = this.videoTag.nativeElement;
    videoElement.onended = () => {
      endHandler();
    }

    if (Capacitor.getPlatform() === 'web') {
      videoElement.muted = true;
    }

    videoElement.play();
  }

  slideNext(sliders: any) {
    const currentSlide = sliders.content.activeIndex;
    if (currentSlide === 1) {
      sliders.asset.slideTo(2);
    }
    else {
      sliders.asset.slideNext(500);
    }

    sliders.content.slideNext(500);
  }

  async allowBluetooth() {
    try {
      const checkPermissions = await this._bluetoothService.checkPermissions();
      if (checkPermissions === 'granted') {
        this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-honey-yellow'));
        this.sliderPage.slideNext();
      }
    }
    catch (error) {
      console.log('allowBluetooth > error: ', error);
    }
  }

  async allowNotifications() {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      let permissionStatus = await PushNotifications.checkPermissions();
      
      if (permissionStatus.receive === 'prompt') {
        permissionStatus = await PushNotifications.requestPermissions();
      }

      if (permissionStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      if (permissionStatus.receive === 'granted') {
        this.showDosesSelector();
      }

      await PushNotifications.register();
    }
    else {
      this.showDosesSelector();
    }
  }

  showDosesSelector() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-white'));
    this._store.dispatch(new fromSharedStore.SliderPageSetContent({
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
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-honey-yellow'));
              this._store.dispatch(new fromSharedStore.SliderPageSetContent({
                isExpanded: false,
                template: `
                  <h1 class="font-heading-1--bold">Allow Notifications.</h1>
                  <p>To help you remember your dose schedule and know when medication is at the right temperature, please <strong>enable notifications.</strong> You can customize notifications in the Settings menu.</p>
                `,
                actions: [
                  {
                    label: 'Allow Notifications',
                    action: () => { this.allowNotifications() }
                  },
                ],
              }));
            },
          },
          {
            label: 'Proceed',
            action: () => {
              if (this.welcomeFormGroup.get('doses')?.valid) {
                this._store.dispatch(new fromSharedStore.SliderPageSetContent({
                  isExpanded: false
                }));
                this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-lime'));
                this.sliderPage.slideNext();
              }
            },
          },
        ],
      }
    }));
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
