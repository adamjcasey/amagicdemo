import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromSharedStore from '@shared/store';
import * as fromSharedComponents from '@shared/components';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-prepare',
  templateUrl: 'start-dose-prepare.page.html',
  styleUrls: ['start-dose-prepare.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDosePreparePage implements OnInit {
  public slides: Array<any> = [];
  @ViewChild('sliderPage', { static: false }) sliderPage!: fromSharedComponents.SliderPageComponent;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.slides = [
      {
        header: {
          color: '--color-bg-pastel-purple',
          asset: 'assets/images/start-dose-prepare-1.svg',
        },
        content: {
          showNavigation: false,
          template: `
            <h1 class="font-heading-1--bold">Take the autoinjector out of the box.</h1>
            <p>Your Automagic autoinjector will turn on automatically when you pick it up.</p>
          `,
          actions: [
            {
              label: 'Continue',
              action: () => { 
                this.sliderPage.slideNext() 
              }
            }
          ],
        }
      },
      {
        header: {
          color: '--color-bg-pastel-mint',
          asset: 'assets/images/start-dose-prepare-2.svg',
        },
        content: {
          showNavigation: false,
          actions: null,
          template: `
            <h1 class="font-heading-1--bold">Connecting...</h1>
          `,
        },
      },
      {
        header: {
          color: '--color-bg-pastel-mint',
          asset: 'assets/images/start-dose-prepare-3.svg',
        },
        content: {
          showNavigation: false,
          template: `
            <h1 class="font-heading-1--bold">Connected!</h1>
          `,
          cards: [
            {
              asset: '/assets/images/dose.svg',
              title: 'Theryx®, 80mg',
              description: 'Synthesized in Dayton, OH on 05/04/2023',
              disclamerText: 'Expires 06/24/2024',
            }
          ],
          actions: [
            {
              label: 'Continue',
              action: () => {
                this.showStepTemperature();
              }
            }
          ],
        },
      },
    ]
  }

  ngOnInit() {}

  slideNext(sliders: any) {
    sliders.asset.slideNext(500);
    sliders.content.slideNext(500);

    const currentSlide = sliders.content.activeIndex;
    if (currentSlide === 1) {
      // TODO: refactor this, make the Bluetooth connection to the device.
      // simulate bluetooth connection process.
      setTimeout(() => {
        this.sliderPage.slideNext()
      }, 3000);
    }
  }

  showStepTemperature = () => {
    this._store.dispatch(new fromSharedStore.SliderPageSetContent({
      isExpanded: true,
      template: `
        <div class="start-dose-prepare__instructions">
          <img src="assets/images/drug-cold-temp.svg" />
          <h1 class="font-heading-1--bold">Theryx® temperature</h1>

          <div class="temperature-status">
            <p class="indicator">
              46°
              <span>Current</span>
            </p>
            <p class="indicator">
              65°
              <span>Recommended</span>
            </p>
          </div>
          <h3>Your Theryx® is currently too cold for a comfortable injection.</h3>
          <p>It's best to let it warm up for a bit to room temperature (65°F) before injecting.</p>
        </div>
      `,
      toolbar: {
        actions: [
          {
            label: 'Proceed',
            action: () => {
              this.showStepTempTimer();
            },
          }
        ],
      }
    }));
  }

  showStepTempTimer() {
    this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
      template: null,
      component: 'start-dose-prepare-temp-timer',
      toolbar: {
        actions: [
          {
            label: 'Ok, let’s go!',
            // setting as disabled to avoid user unnecessary action, 
            // will be enable after show Dose setup view
            disabled: true,
            action: () => {
              this.showStepInspect();
            },
          }
        ],
      }
    }));
  }

  showStepInspect() {
    this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
      component: null,
      template: `
        <div class="start-dose-prepare__instructions">
          <img src="assets/images/drug-window.svg" />
          <h1 class="font-heading-1--bold">Inspect your Theryx®</h1>
          <div class="inspection">
            <div class="statement incorrect">
              <h3>
                <ion-icon name="close-circle"></ion-icon>
                Do not proceed if it is
              </h3>
              <p>Cloudy</p>
              <p>Has floating specks</p>
              <p>Has turned yellow</p>
            </div>

            <div class="statement correct">
              <h3>
                <ion-icon name="checkmark-circle"></ion-icon>
                Proceed if it is
              </h3>
              <p>Clear</p>
            </div>
          </div>
        </div>
      `,
      toolbar: {
        actions: [
          {
            label: 'Looks off',
            action: () => {
              console.log('click looks off');
            },
          },
          {
            label: 'Looks good',
            action: () => {
              this.showStepSurvey();
            },
          }
        ],
      }
    }));
  }

  showStepSurvey() {
    this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
      template: `
        <div class="start-dose-prepare__survey">
          <h1 class="font-heading-1--bold">While you’re waiting, how are you feeling?</h1>
          <p>Tracking these ratings over time can help you<br> and your care team understand how Theryx®<br> impacts your condition.</p>
        </div>
      `,
      component: 'start-dose-prepare-survey',
      toolbar: {
        actions: [
          {
            label: 'Skip',
            action: () => {
              this.showStepWaitingToInject();
            },
          },
          {
            label: 'Proceed',
            action: () => {
              this.showStepWaitingToInject();
            },
          }
        ],
      }
    }));
  }

  showStepWaitingToInject() {
    this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
      template: null,
      component: 'start-dose-prepare-waiting-to-inject',
      toolbar: {
        actions: [
          {
            label: 'Ok, let’s go!',
            // button will be disabled until finish the timer
            disabled: true
          },
        ],
      }
    }));
  }
}
