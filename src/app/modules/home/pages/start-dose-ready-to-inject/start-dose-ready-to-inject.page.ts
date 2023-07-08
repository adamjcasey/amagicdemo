import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '@home/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedComponents from '@shared/components';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-ready-to-inject',
  templateUrl: 'start-dose-ready-to-inject.page.html',
  styleUrls: ['start-dose-ready-to-inject.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectPage implements OnInit {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public slides: Array<any> = [];
  @ViewChild('sliderPage', { static: false }) sliderPage!: fromSharedComponents.SliderPageComponent;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    // this.slides = [
    //   {
    //     color: 'var(--color-bg-pastel-purple)',
    //     asset: 'assets/images/start-dose-1.svg',
    //     showNavigation: false,
    //     content: `
    //       <h1 class="font-heading-1--bold">Take the autoinjector out of the box.</h1>
    //       <p>Your Automagic autoinjector will turn on automatically when you pick it up.</p>
    //     `,
    //     actions: [
    //       {
    //         label: 'Continue',
    //         action: () => { this.sliderPage.slideNext() }
    //       }
    //     ],
    //   },
    //   {
    //     color: 'var(--color-bg-pastel-mint)',
    //     asset: 'assets/images/start-dose-2.svg',
    //     showNavigation: false,
    //     content: `
    //       <h1 class="font-heading-1--bold">Connecting...</h1>
    //     `,
    //   },
    //   {
    //     color: 'var(--color-bg-pastel-mint)',
    //     asset: 'assets/images/start-dose-3.svg',
    //     showNavigation: false,
    //     content: `
    //       <h1 class="font-heading-1--bold">Connected!</h1>
    //     `,
    //     cards: [
    //       {
    //         asset: '/assets/images/dose.svg',
    //         title: 'Theryx®, 80mg',
    //         description: 'Synthesized in Dayton, OH on 05/04/2023',
    //         disclamerText: 'Expires 06/24/2024',
    //       }
    //     ],
    //     // button: {
    //     //   label: 'Continue',
    //     //   action: () => {
    //     //     this.showStepTemperature();
    //     //   }
    //     // },
    //   },
    // ]
  }

  ngOnInit() {
    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;

        // if this is the first dose
        if (this.homeConfig.firstTimeDose) {
          this.slides.unshift({
            color: 'var(--color-bg-pastel-green)',
            assetTemplate: `
              <div class="first-time-dose">
                <h1 class="font-heading-1--bold">First time user?</h1>
                <p>This video previews what to expect when self-dosing with AutoMagic.</p>
                <div class="first-time-dose__video-indicator">
                  <ion-icon name="play-outline"></ion-icon>
                  <img src="assets/images/start-dose-first-time-dose.svg">
                </div>
                <p>You’ll be guided through the entire dosing process next.</p>
              </div>
            `,
            showNavigation: false,
            actions: [
              {
                label: 'Skip',
                fill: 'outline',
                action: () => {
                  this.sliderPage.slideNext();
                  this._store.dispatch(new fromSharedStore.BackdropShow({
                    transition: 'move',
                    header: true,
                    template: `
                      <div class="no-needless-message">
                        <h1 class="font-heading-1--bold">No needles and no drugs</h1>
                        <p>This demo unit does not have a needle nor drug substance.</p>
                        <p>Feel free to act like a real patient and press this against your leg when instructed.</p>
                        <img src="assets/images/no-needles.svg">
                      </div>
                    `,
                  }));
                }
              }
            ]
          });
        }
      }
    });
  }

  setFirstTimeConfig() {
    if (this.homeConfig.firstTimeDose) {
      const playButton = document.querySelector('.first-time-dose__video-indicator');
      playButton?.addEventListener('click', () => {
        // first add a new step and set it as the next one to the 
        // current sliderPage component
        this.slides.splice(1, 0, {
          color: 'var(--color-bg-pastel-green)',
          assetTemplate: `
            <div class="first-time-dose">
              <div #videoWrapper>
                <video 
                  #videoTag 
                  id="first-dose-video"
                  class="first-time-dose__video" 
                  src="/assets/videos/first-dose-video.mp4" 
                  fullscreen="true"
                ></video>
              </div>
            </div>
          `,
          actions: [
            {
              label: 'Continue',
              fill: 'outline',
              action: () => {
                this.sliderPage.slideNext();
                // clear video
              }
            }
          ]
        });
        // then move the current sliderPage component
        this.sliderPage.slideNext();
      });
    }
  }
}
