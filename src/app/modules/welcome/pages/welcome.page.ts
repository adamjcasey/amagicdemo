import {
  Component,
  ViewEncapsulation,
  ViewChild,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { PushNotifications } from '@capacitor/push-notifications';

import * as fromStore from '../store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedComponent from '@shared/components';

@Component({
  selector: 'automagic-welcome',
  templateUrl: 'welcome.page.html',
  styleUrls: ['welcome.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomePage implements OnInit {
  public pageData$: Observable<any>;
  public pageData: any;
  public slides: Array<any> = [];
  public welcomeFormGroup: FormGroup;
  @ViewChild('sliderPage', { static: false }) sliderPage!: fromSharedComponent.SliderPageComponent;

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

    this.slides = [
      {
        color: 'var(--color-bg-pastel-green)',
        asset: 'assets/images/welcome-step-1.svg',
        content: `
          <h1 class="font-heading-1--bold">Welcome to Theryx AutoMagic.</h1>
          <p>The AutoMagic connected ecosystem empowers you to make the most of your Theryx prescription</p>
        `,
        button: {
          label: 'Get started',
          action: () => { this.sliderPage.slideNext() }
        },
        showNavigation: false,
      },
      {
        color: 'var(--color-bg-pastel-green)',
        asset: 'assets/images/welcome-step-1.svg',
        content: `
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
                this.inputName(event);
              },
            }
          ],
        },
        button: {
          label: 'Continue',
          action: () => {
            if (this.welcomeFormGroup.get('name')?.valid) {
              this.sliderPage.slideNext();
            }
            else {
              this.welcomeFormGroup.get('name')?.markAllAsTouched();
            }
          }
        }
      },
      {
        color: 'var(--color-bg-pastel-blue)',
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
        color: 'var(--color-bg-pastel-honey-yellow)',
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
        color: 'var(--color-bg-pastel-lime)',
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
        }
      }
    });
  }

  showPinCodeInput() {
    this._store.dispatch(new fromSharedStore.BackdropShow({
      transition: 'fade',
      fullScreen: true,
      header: false,
      component: 'welcome-sign-up',
    }));
  }

  slideNext(sliders: any) {
    const currentSlide = sliders.content.activeIndex;
    if (currentSlide > 1) {
      if (currentSlide === 2) {
        sliders.asset.slideTo(2);
      }
      else {
        sliders.asset.slideNext(500);
      }
    }

    sliders.content.slideNext(500);
  }

  inputName(event: any) {
    this._store.dispatch(new fromStore.SetData({
      name: event.target.value
    }));
  }

  async allowBluetooth() {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      this.sliderPage.slideNext();
      // await BleClient.initialize()
      // const isEnabled = await BleClient.isEnabled()
    }
    else {
      this.sliderPage.slideNext();
    }
  }

  async allowNotifications() {
    const showDosesSelector = () => {
      this.sliderPage.expandContent({
        isExpanded: true,
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
                  this.sliderPage.expandContent({
                    isExpanded: false
                  });
                  this.sliderPage.slideNext();
                }
                else {
                  // show error message if the user don't select a date
                }
              },
            }
          ],
        }
      });
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
