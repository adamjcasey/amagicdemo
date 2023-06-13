import {
  Component,
  ViewChild,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Capacitor } from '@capacitor/core';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { PushNotifications } from '@capacitor/push-notifications';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination, EffectFade } from 'swiper';
// install Swiper modules
SwiperCore.use([Pagination, EffectFade]);

import * as fromSharedStore from '@shared/store';
import * as fromSharedDirectives from '@shared/directives'
import { WelcomeSignUpComponent } from '../components';

@Component({
  selector: 'automagic-welcome',
  templateUrl: 'welcome.page.html',
  styleUrls: ['welcome.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomePage implements AfterContentInit {
  @ViewChild('sliderAsset', { static: false }) sliderAsset!: SwiperComponent;
  @ViewChild('sliderContent', { static: false }) sliderContent!: SwiperComponent;
  public sliderItems: Array<any> = [];
  public currentStep: number = 1;

  @ViewChild(fromSharedDirectives.HostDirective, { static: true }) host!: fromSharedDirectives.HostDirective;
  public welcomeFormGroup: FormGroup;

  constructor(
    private _router: Router,
    private _store: Store<fromSharedStore.SharedState>,
    private _formBuilder: FormBuilder,
  ) {
    this.welcomeFormGroup = this._formBuilder.group({
      name: ['', [ Validators.required ]]
    });

    this.sliderItems = [
      {
        asset: 'assets/images/welcome-step-1.svg',
        content: `
          <h1 class="font-heading-1--bold">Welcome to Theryx AutoMagic.</h1>
          <p>The AutoMagic connected ecosystem empowers you to make the most of your Theryx prescription</p>
        `,
        buttonLabel: 'Get started',
        buttonAction: () => { this.slideNext() }
      },
      {
        asset: 'assets/images/welcome-step-1.svg',
        content: `
          <h1 class="font-heading-1--bold">Let’s get to know each other.</h1>
        `,
        form: {
          field: 'name',
        },
        buttonLabel: 'Continue',
        buttonAction: () => {
          if (this.welcomeFormGroup.valid) {
            this.slideNext();
          }
          else {
            this.welcomeFormGroup.get('name')?.markAllAsTouched();
          }
        }
      },
      {
        asset: 'assets/images/welcome-step-2.svg',
        content: `
          <h1 class="font-heading-1--bold">Let's get connected.</h1>
          <p>To get the most out of your connected autoinjector and enable dose tracking and help with your injection experience, please enable bluetooth.</p>
        `,
        buttonLabel: 'Enable Bluetooth',
        buttonAction: () => { this.allowBluetooth() }
      },
      {
        asset: 'assets/images/welcome-step-3.svg',
        content: `
          <h1 class="font-heading-1--bold">Allow Notifications.</h1>
          <p>To help you remember your dose schedule and know when medication is at the right temperature, please <strong>enable notifications.</strong> You can customize notifications in the Settings menu.</p>
        `,
        buttonLabel: 'Allow Notifications',
        buttonAction: () => { this.allowNotifications() }
      },
      {
        asset: 'assets/images/welcome-step-4.svg',
        content: `
          <h1 class="font-heading-1--bold">You're ready to rock!</h1>
          <p>To help you remember your dose schedule and know when medication is at the right temperature, please <strong>enable notifications.</strong> You can customize notifications in the Settings menu.</p>
        `,
        buttonLabel: 'Continue',
        buttonAction: () => { this.goTo('home') }
      },
    ];
  }

  ngAfterContentInit() {
    this._store.dispatch(new fromSharedStore.BackdropTopShow({
      transition: 'fade',
      fullScreen: true,
      header: false,
      // component: WelcomeSignUpComponent,
      component: true,
    }));
  }

  slidePrev() {
    this.sliderAsset.swiperRef.slidePrev(500);
    this.sliderContent.swiperRef.slidePrev(500);
  }

  slideNext() {
    if (this.currentStep > 1) {
      if (this.currentStep === 2) {
        this.sliderAsset.swiperRef.slideTo(2);
      }
      else {
        this.sliderAsset.swiperRef.slideNext(500);
      }
    }

    this.sliderContent.swiperRef.slideNext(500);
  }

  onSlideChange() {
    this.currentStep = this.sliderContent.swiperRef.activeIndex + 1;
  }

  async allowBluetooth() {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      this.slideNext();
      // await BleClient.initialize()
      // const isEnabled = await BleClient.isEnabled()
      // alert(`isEnabled? ${isEnabled}`);
    }
    else {
      this.slideNext();
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
        this.slideNext();
      }

      await PushNotifications.register();
    }
    else {
      this.slideNext();
    }
  }

  goTo(path: string) {
    this._router.navigate([path]);
  }
}
