import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '../../store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedComponents from '@shared/components';

@Component({
  selector: 'automagic-start-dose',
  templateUrl: 'start-dose.component.html',
  styleUrls: ['start-dose.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseComponent implements OnInit {
  public pageData$!: Observable<any>;
  public pageData: any;
  public slides: Array<any> = [];
  @ViewChild('sliderPage', { static: false }) sliderPage!: fromSharedComponents.SliderPageComponent;

  constructor(
    private _store: Store<fromStore.HomeState>,
  ) {
    this.pageData$ = this._store.select(fromStore.getHomeState);
    this.slides = [
      {
        color: 'var(--color-bg-pastel-purple)',
        asset: 'assets/images/start-dose-1.svg',
        showNavigation: false,
        content: `
          <h1 class="font-heading-1--bold">Take the autoinjector out of the box.</h1>
          <p>Your Automagic autoinjector will turn on automatically when you pick it up.</p>
        `,
        button: {
          label: 'Continue',
          action: () => { this.sliderPage.slideNext() }
        },
      },
      {
        color: 'var(--color-bg-pastel-mint)',
        asset: 'assets/images/start-dose-2.svg',
        showNavigation: false,
        content: `
          <h1 class="font-heading-1--bold">Connecting...</h1>
        `,
      },
      {
        color: 'var(--color-bg-pastel-mint)',
        asset: 'assets/images/start-dose-3.svg',
        showNavigation: false,
        content: `
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
        button: {
          label: 'Continue',
          action: () => {
            this.showStepTemperature();
          }
        },
      },
    ]
  }

  ngOnInit() {
    this.pageData$.subscribe(pageData => {
      if (pageData) {
        this.pageData = pageData;
      }
    });
  }

  slideNext(sliders: any) {
    sliders.asset.slideNext(500);
    sliders.content.slideNext(500);

    const currentSlide = sliders.content.activeIndex;
    if (currentSlide === 1) {
      // TODO: refactor this, make the Bluetooth connection to the device.
      setTimeout(() => {
        this.sliderPage.slideNext()
      }, 3000);
    }
  }

  showStepTemperature = () => {
    this._store.dispatch(new fromSharedStore.SliderPageExpandContent({
      isExpanded: true,
      template: `
        <div class="start-dose__instructions">
          <img src="assets/images/drug-temp.svg" />
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
              this.showStepTimer();
            },
          }
        ],
      }
    }));
  }

  showStepTimer() {
    this._store.dispatch(new fromSharedStore.SliderPageExpandContent({
      template: `
        <div class="start-dose__instructions">
          <img src="assets/images/drug-settings.svg" />
          <h1 class="font-heading-1--bold">Theryx® temperature</h1>
          <h3>Set the injector somewhere safe while the medicine warms up</h3>
          <p>SWe’ll notify you when in about 12 minutes when it’s ready.</p>
          <div class="timer">
            <p>12:00</p>
          </div>
          <p>While you wait, let’s take care of some other preparation.</p>
        </div>
      `,
      toolbar: {
        actions: [
          {
            label: 'Ok, let’s go!',
            action: () => {
              // TODO: Start the timer
              this.showStepDoseSetup();
            },
          }
        ],
      }
    }));
  }

  showStepDoseSetup() {
    this._store.dispatch(new fromSharedStore.SliderPageExpandContent({
      template: `
        <div class="start-dose__instructions">
          <img src="assets/images/drug-settings.svg" />
          <h1 class="font-heading-1--bold">Dose setup</h1>
          <h3>Let’s finish setting up for the dose while Theryx® warms to room temperature.</h3>
          <p>There’s a countdown and a notification will remind you.</p>
          <div class="timer">
            <p>12:00</p>
          </div>
        </div>
      `,
      toolbar: {
        actions: [
          {
            label: 'Ok, let’s go!',
            action: () => {
              this.showStepInspect();
            },
          },
        ]
      },
    }));

    this._store.dispatch(new fromSharedStore.BackdropShow({
      transition: 'move',
      fullScreen: true,
      header: true,
      bgTemplate: 'bottom-hole',
      template: `
        <h1 class="font-heading-1--bold">No need to wait!</h1>
        <p>For this demo we’ve sped up the<br> warming time.</p>
      `,
    }));
  }

  showStepInspect() {
    this._store.dispatch(new fromSharedStore.SliderPageExpandContent({
      template: `
        <div class="start-dose__instructions">
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
    this._store.dispatch(new fromSharedStore.SliderPageExpandContent({
      template: `
        <div class="start-dose__survey">
          <h1 class="font-heading-1--bold">While you’re waiting, how are you feeling?</h1>
          <p>Tracking these ratings over time can help you<br> and your care team understand how Theryx®<br> impacts your condition.</p>
        </div>
      `,
      component: 'start-dose-survey',
      toolbar: {
        actions: [
          {
            label: 'Skip',
            action: () => {
              // code
            },
          },
          {
            label: 'Proceed',
            action: () => {
              // code
            },
          }
        ],
      }
    }));
  }
}
