import {
  Component,
  ViewChild,
  ViewEncapsulation,
  AfterContentInit,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { PushNotifications } from '@capacitor/push-notifications';
import { SwiperComponent } from 'swiper/angular';

// Swiper Config
import SwiperCore, { Pagination, EffectFade } from 'swiper';
SwiperCore.use([Pagination, EffectFade]);

import * as fromStore from '../store'
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-welcome',
  templateUrl: 'welcome.page.html',
  styleUrls: ['welcome.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomePage implements OnInit, AfterContentInit {
  public pageData$: Observable<any>;
  public pageData: any;
  @ViewChild('sliderAsset', { static: false }) sliderAsset!: SwiperComponent;
  @ViewChild('sliderContent', { static: false }) sliderContent!: SwiperComponent;
  public sliderItems: Array<any> = [];
  public currentStep: number = 1;
  public welcomeFormGroup: FormGroup;

  constructor(
    private _router: Router,
    private _store: Store<fromSharedStore.SharedState>,
    private _formBuilder: FormBuilder,
  ) {
    this.pageData$ = this._store.select(fromStore.getWelcomeState);
    this.welcomeFormGroup = this._formBuilder.group({
      name: ['', [ Validators.required ]],
      doses: ['', [ Validators.required ]],
    });

    this.sliderItems = [
      {
        asset: 'assets/images/welcome-step-1.svg',
        content: `
          <h1 class="font-heading-1--bold">Welcome to Theryx AutoMagic.</h1>
          <p>The AutoMagic connected ecosystem empowers you to make the most of your Theryx prescription</p>
        `,
        button: {
          label: 'Get started',
          action: () => { this.slideNext() }
        },
      },
      {
        asset: 'assets/images/welcome-step-1.svg',
        content: `
          <h1 class="font-heading-1--bold">Let’s get to know each other.</h1>
        `,
        form: {
          field: 'name',
        },
        button: {
          label: 'Continue',
          action: () => {
            if (this.welcomeFormGroup.get('name')?.valid) {
              this.slideNext();
            }
            else {
              this.welcomeFormGroup.get('name')?.markAllAsTouched();
            }
          }
        }
      },
      {
        asset: 'assets/images/welcome-step-2.svg',
        content: `
          <h1 class="font-heading-1--bold">Let's get connected.</h1>
          <p>To get the most out of your connected autoinjector and enable dose tracking and help with your injection experience, please enable bluetooth.</p>
        `,
        button: {
          label: 'Enable Bluetooth',
          action: () => { this.allowBluetooth() }
        },
      },
      {
        asset: 'assets/images/welcome-step-3.svg',
        content: `
          <h1 class="font-heading-1--bold">Allow Notifications.</h1>
          <p>To help you remember your dose schedule and know when medication is at the right temperature, please <strong>enable notifications.</strong> You can customize notifications in the Settings menu.</p>
        `,
        button: {
          label: 'Allow Notifications',
          action: () => { this.allowNotifications() }
        },
      },
      {
        asset: 'assets/images/welcome-step-4.svg',
        content: `
          <h1 class="font-heading-1--bold">You're ready to rock!</h1>
          <p>Your app is configured to harness the power of the AutoMagic autoinjector.</p>
        `,
        button: {
          label: 'Continue',
          action: () => { this.goTo('home') }
        },
      },
    ];
  }

  ngOnInit() {
    this.pageData$.subscribe(pageData => {
      if (pageData) {
        this.pageData = pageData;
        if (this.pageData?.doses.length > 0) {
          this.welcomeFormGroup.patchValue({
            doses: this.pageData.doses
          });
          if (document.getElementById('backdrop-bottom')?.classList.contains('is-open')) {
            const toolbarTemplate = document.querySelector('#backdrop-bottom .backdrop-bottom__toolbar-template strong');
            if (toolbarTemplate !== null) {
              toolbarTemplate.textContent = `${this.pageData.doses.length} ${this.pageData.doses.length > 1 ? 'doses' : 'dose'}`;
            }
          }
        }
      }
    });
  }

  ngAfterContentInit() {
    this._store.dispatch(new fromSharedStore.BackdropTopShow({
      transition: 'fade',
      fullScreen: true,
      header: false,
      component: 'welcome-sign-up',
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

  inputName(event: any) {
    this._store.dispatch(new fromStore.SetData({
      name: event.target.value
    }));
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
    const showDosesSelector = () => {
      this._store.dispatch(new fromSharedStore.BackdropBottomShow({
        header: false,
        template: `
          <h1 class="font-heading-1--bold"> Let’s set the<br> dose schedule for<br> those notifications.</h1>
          <p>Typical dosing for Theryx:<br> 1 weekly for the first 4 weeks,<br> Every 2 weeks afterwards</p>
        `,
        component: 'welcome-doses-selector',
        toolbar: {
          template: `
            <p><strong>6 doses</strong> are preselected</p>
          `,
          actions: [
            {
              label: 'Proceed',
              action: () => {
                if (this.welcomeFormGroup.get('doses')?.valid) {
                  this._store.dispatch(new fromSharedStore.BackdropBottomClose());
                  this.slideNext();
                }
                else {
                  // show error message if the user don't select a date
                }
              },
            }
          ],
        }
      }));
    }
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      let permissionStatus = await PushNotifications.checkPermissions();
      
      if (permissionStatus.receive === 'prompt') {
        permissionStatus = await PushNotifications.requestPermissions();
      }

      if (permissionStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      if (permissionStatus.receive === 'granted') {
        showDosesSelector();
      }

      await PushNotifications.register();
    }
    else {
      showDosesSelector();
    }
  }

  goTo(path: string) {
    this._router.navigate([path]);
  }
}
