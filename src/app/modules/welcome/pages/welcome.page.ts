import {
  Component,
  ViewChild,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from "@ngrx/store";
import { SwiperComponent } from "swiper/angular";
import SwiperCore, { Pagination, EffectFade } from 'swiper';
// install Swiper modules
SwiperCore.use([Pagination, EffectFade]);

import * as fromStore from '@shared/store';
import * as fromSharedDirectives from '@shared/directives'
import { WelcomeTestComponent } from '../components';

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

  @ViewChild(fromSharedDirectives.HostDirective, {static: true}) host!: fromSharedDirectives.HostDirective;

  constructor(
    private _router: Router,
    private _store: Store<fromStore.SharedState>,
  ) {
    this.sliderItems = [
      {
        asset: 'assets/images/welcome-step-1.svg',
        content: `
          <h1 class="font-heading-1--bold">Let’s get connected.</h1>
          <h3>Welcome to AutoMagicTM</h3>
          <p>The most advanced single-use autoinjector</p>
          <p>Your first guided injection will take about <strong>10 minutes.</strong></p>
        `,
        buttonLabel: 'Get started',
        buttonAction: () => { this.slideNext() }
      },
      {
        asset: 'assets/images/welcome-step-2.svg',
        content: `
          <h1 class="font-heading-1--bold">We’re ready to pair.</h1>
          <p>To get the most out of your connected autoinjector and enable dose tracking and help with your injection experience, please enable bluetooth.</p>
        `,
        buttonLabel: 'Connect Bluetooth',
        buttonAction: () => { this.slideNext() }
      },
      {
        asset: 'assets/images/welcome-step-3.svg',
        content: `
          <h1 class="font-heading-1--bold">Allow Notifications.</h1>
          <p>To help you remember your dose schedule and know when medication is at the right temperature, please <strong>enable notifications.</strong> You can customize notifications in the Settings menu.</p>
        `,
        buttonLabel: 'Allow Notifications',
        buttonAction: () => { this.slideNext() }
      },
      {
        asset: 'assets/images/welcome-step-4.svg',
        content: `
          <h1 class="font-heading-1--bold">Take the autoinjector out of the box.</h1>
        `,
        buttonLabel: 'Continue',
        buttonAction: () => { this.slideNext() }
      },
      {
        asset: 'assets/images/welcome-step-5.svg',
        content: `
          <h1 class="font-heading-1--bold">Connecting...</h1>
        `,
      },
      {
        asset: 'assets/images/welcome-step-6.svg',
        content: `
          <h1 class="font-heading-1--bold">Connected!</h1>
        `,
        buttonLabel: 'Continue',
        buttonAction: () => { this.goTo('/home') },
        cards: [
          {
            asset: 'assets/images/welcome-step-6-drug.svg',
            title: 'Theryx®, 80mg',
            description: `<p>Synthesized in Indiana, I'll on 05/04/2023</p>`,
            disclamerText: `<p>Expires 06/24/2024</p>`
          }
        ]
      }
    ];
  }

  ngAfterContentInit() {
    this._store.dispatch(new fromStore.OverlayShow({
      options: {
        transition: 'fade',
        fullScreen: true,
        showHeader: false,
      },
      content: true,
    }));
  }

  slidePrev() {
    this.sliderAsset.swiperRef.slidePrev(500);
    this.sliderContent.swiperRef.slidePrev(500);
  }

  slideNext() {
    this.sliderAsset.swiperRef.slideNext(500);
    this.sliderContent.swiperRef.slideNext(500);
  }

  onSlideChange() {
    this.currentStep = this.sliderAsset.swiperRef.activeIndex + 1;
    if (this.currentStep === 5) {
      setTimeout(() => {
        this.slideNext();
      }, 4000);
    }
  }

  goTo(path: string) {
    this._router.navigate([path]);
  }
}
