import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, Observable, take, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceStateCode } from '@app/shared/libs/bluetooth';
import { MOCK_SCENARIO_IDS } from '@app/shared/libs/bluetooth/constants/bluetooth-mock.constants';
import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import { IonContent } from '@ionic/angular/standalone';
import { DeviceConnectionAbstract } from '@shared/abstracts/device-connection.abstract';
import * as fromSharedComponents from '@shared/components';
import * as fromSharedStore from '@shared/store';

export enum FirstTimeSlides {
  VideoTraining = 0,
  Video = 1,
  Welcome = 2,
  QuickGuide = 3,
  BodyPartSelector = 4,
  CleanSite = 5,
  UncapInjector = 6,
  AlmostThere = 7,
  WaitingToStart = 8,
  Dosing = 9,
  PlungerRetracting = 10,
}

export enum NonFirstTimeSlides {
  Welcome = 0,
  QuickGuide = 1,
  BodyPartSelector = 2,
  WaitingToStart = 3,
  Dosing = 4,
  PlungerRetracting = 5,
}

@Component({
  selector: 'automagic-start-dose-ready-to-inject',
  templateUrl: 'start-dose-ready-to-inject.page.html',
  styleUrls: ['start-dose-ready-to-inject.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    fromSharedComponents.SliderPageComponent,
  ],
})
export class StartDoseReadyToInjectPage
  extends DeviceConnectionAbstract
  implements OnInit
{
  public homeConfig$!: Observable<any>;
  public deviceStateName$!: Observable<string>;
  public sliderPageConfig$!: Observable<any>;
  public homeConfig: any;
  public sliderPageConfig: any;
  public readyForInjection: boolean = false;
  public slides: Array<any> = [];

  isInjecting$: Observable<boolean> = this._store.select(
    fromBluetoothStore.isInjectingState
  );
  isRemoveCassette$: Observable<boolean> = this._store.select(
    fromBluetoothStore.isRemoveCassetteState
  );
  successfulDoses$: Observable<number> = this._store.select(
    fromBluetoothStore.getSuccessfulDoses
  );

  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _cdr: ChangeDetectorRef
  ) {
    super();
    this.sliderPageConfig$ = this._store.select(
      fromSharedStore.getSliderPageConfig
    );
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.deviceStateName$ = this._store.select(
      fromBluetoothStore.getDeviceStateName
    );
  }

  ngOnInit() {
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green')
    );

    this.sliderPageConfig$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((sliderPageConfig) => {
        if (sliderPageConfig) {
          this.sliderPageConfig = sliderPageConfig;
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          this.buildSlides();
          this._cdr.detectChanges();
        }
      });

    this.deviceStateName$
      .pipe(
        filter((stateName) => stateName === 'ReadyForInjection'),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.readyForInjection = true;
        this.buildSlides();
        this._cdr.detectChanges();
      });
  }

  private buildSlides() {
    this.slides = [
      {
        header: {
          color: '--color-bg-pastel-green',
          template: this.homeConfig.firstTimeDose
            ? `
                      <div class="start-dose-ready-to-inject__content">
                        <h1 class="font-heading-1--bold">You've got this!</h1>
                        <p><strong>This guide will walk you through every step.</strong></p>
                        <img src="assets/images/start-dose-ready-to-inject-start--first.svg">
                      </div>`
            : `
                      <div class="start-dose-ready-to-inject__content">
                        <h1 class="font-heading-1--bold">Ready to inject?</h1>
                        <p><strong>At this point you're a pro, want to inject without guidance?</strong></p>
                        <img src="assets/images/start-dose-ready-to-inject-start.svg">
                      </div>`,
        },
        content: {
          hideNavigation: true,
          actions: [
            {
              label: this.homeConfig?.firstTimeDose ? 'Postpone' : 'View Guide',
              action: () => {
                if (this.homeConfig.firstTimeDose) {
                  this._store.dispatch(
                    new fromSharedStore.BackdropShow({
                      transition: 'move',
                      header: true,
                      contentCentered: true,
                      showBackButton: false,
                      template: `
                              <div class="no-needless-message">
                                <h1 class="font-heading-1--bold">Postpone gives patients control.</h1>
                                <p>This Postpone feature is for patients who encounter anxiety at their dose time.</p>
                                <p>For the purpose of this demo, please <strong>Continue</strong></p>
                              </div>
                            `,
                    })
                  );
                } else {
                  this.sliderPage.slideNext();
                }
              },
            },
            {
              label: 'Continue',
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-honey-yellow'
                  )
                );
                const bodyShapeSlideIndex = this.homeConfig?.firstTimeDose
                  ? FirstTimeSlides.BodyPartSelector
                  : NonFirstTimeSlides.BodyPartSelector;
                this.sliderPage.slideTo(bodyShapeSlideIndex);
              },
            },
          ],
        },
      },
      {
        header: {
          color: '--color-bg-pastel-green',
          template: `
                    <h1 class="font-heading-1--bold">Injection quick guide</h1>
                  `,
          cards: [
            {
              type: 'guide-step',
              indicator: 1,
              title: 'Select the injection site',
              asset: '/assets/images/injection-quick-guide-1.svg',
            },
            {
              type: 'guide-step',
              indicator: 2,
              title: 'Clean the site',
              asset: '/assets/images/injection-quick-guide-2.svg',
            },
            {
              type: 'guide-step',
              indicator: 3,
              title: 'Remove the cap',
              asset: '/assets/images/injection-quick-guide-3.svg',
            },
            {
              type: 'guide-step',
              indicator: 4,
              title: 'Pinch skin and press injector against skin',
              asset: '/assets/images/injection-quick-guide-4.svg',
            },
            {
              type: 'guide-step',
              indicator: 5,
              title: 'Hold injector against skin for 10 seconds ',
              asset: '/assets/images/injection-quick-guide-5.svg',
            },
            {
              type: 'guide-step',
              indicator: 6,
              title: 'Injector will turn green when dose is complete.',
              asset: '/assets/images/injection-quick-guide-6.svg',
            },
          ],
        },
        content: {
          actions: [
            {
              label: 'Continue',
              action: () => {
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
        bodyShapeStep: true,
        header: {
          color: '--color-bg-pastel-honey-yellow',
          template: null,
          component: 'start-dose-ready-to-inject-body-part-selector',
        },
        content: {
          actions: [
            {
              label: 'Previous step',
              action: () => {
                // clear previous selection
                this._store.dispatch(
                  new fromStore.SetData({
                    bodyPartSelected: null,
                  })
                );

                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-green'
                  )
                );
                if (this.homeConfig?.firstTimeDose) {
                  this.sliderPage.slideTo(FirstTimeSlides.Welcome);
                } else {
                  this.sliderPage.slideTo(NonFirstTimeSlides.Welcome);
                }
              },
            },
            {
              label: this.homeConfig.firstTimeDose
                ? 'Next Step'
                : 'Ready to inject',
              disabled: !this.homeConfig.bodyPartSelected,
              action: () => {
                this.sliderPage.slideNext();
                if (this.homeConfig.firstTimeDose) {
                  this._store.dispatch(
                    new fromSharedStore.TopbarChangeColor(
                      '--color-bg-pastel-blue'
                    )
                  );
                  // NOTE: Temporarily hiding the no need to clean message
                  // setTimeout(() => {
                  //   this._store.dispatch(
                  //     new fromSharedStore.BackdropShow({
                  //       transition: 'move',
                  //       fullScreen: true,
                  //       header: true,
                  //       bgTemplate: 'top-hole',
                  //       showBackButton: false,
                  //       template: `
                  //               <div class="no-need-to-clean-message">
                  //                 <h1 class="font-heading-1--bold">No need to clean!</h1>
                  //                 <p>For this demo you will not need to use an alcohol swab.</p>
                  //               </div>
                  //             `,
                  //       buttons: [
                  //         {
                  //           label: 'Got it',
                  //           action: () => {
                  //             this._store.dispatch(
                  //               new fromSharedStore.BackdropHide()
                  //             );
                  //           },
                  //         },
                  //       ],
                  //     })
                  //   );
                  // }, 1500);
                }
              },
            },
          ],
        },
      },
    ];

    // if this is the first dose
    if (this.homeConfig.firstTimeDose) {
      // set steps for video training
      this.slides.unshift(
        {
          header: {
            color: '--color-bg-pastel-green',
            component: 'start-dose-ready-to-inject-first-time-user',
          },
          content: {
            hideNavigation: true,
            actions: [
              {
                label: 'Skip',
                fill: 'outline',
                action: () => {
                  this.sliderPage.slideTo(FirstTimeSlides.Welcome);
                  this.showNoNeedlessMessage();
                },
              },
            ],
          },
        },
        {
          header: {
            fullSize: true,
            color: '--color-bg-pastel-green',
            component: 'start-dose-ready-to-inject-video',
          },
          content: {
            hideNavigation: true,
            actions: [
              {
                label: 'Replay',
                action: () => {
                  const videoElement = document.getElementById(
                    'start-dose-ready-to-inject-video'
                  ) as HTMLMediaElement;
                  if (videoElement) {
                    videoElement.currentTime = 0;
                    videoElement.play();
                  }
                },
              },
              {
                label: 'Continue',
                action: () => {
                  const videoElement = document.getElementById(
                    'start-dose-ready-to-inject-video'
                  ) as HTMLMediaElement;
                  // pausing the video if it's ended
                  if (!videoElement?.ended) {
                    videoElement?.pause();
                  }
                  this._store.dispatch(
                    new fromSharedStore.SliderPageSetHeaderOptions({
                      fullSize: false,
                    })
                  );
                  // remove timeline
                  this._store.dispatch(
                    new fromSharedStore.SliderPageSetContentOptions({
                      timeline: null,
                    })
                  );

                  this.sliderPage.slideNext();
                  this.showNoNeedlessMessage();
                },
              },
            ],
          },
        }
      );
    }

    // set instruction steps to clean-site,
    // uncap-injector, and pre-loading for dosing
    this.slides.push(
      {
        header: {
          color: '--color-bg-pastel-blue',
          template: `
              <div class="start-dose-ready-to-inject__content">
                <h1 class="font-heading-1--bold">Clean site.</h1>
                <img src="assets/images/start-dose-ready-to-inject-clean.svg">
              </div>
            `,
          component: null,
        },
        content: {
          // blockNavigationFor: 1500,
          actions: [
            {
              label: 'Previous step',
              action: () => {
                // clear previous body part selection
                this._store.dispatch(
                  new fromStore.SetData({
                    bodyPartSelected: null,
                  })
                );

                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-honey-yellow'
                  )
                );
                this.sliderPage.slidePrev();
              },
            },
            {
              label: 'Next Step',
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-green'
                  )
                );
                this.sliderPage.slideNext();

                // Mocking value
                window.setTimeout(() => {
                  this._store.dispatch(
                    new fromBluetoothStore.MockDeviceState(
                      DeviceStateCode.ReadyForInjection
                    )
                  );
                }, 1000);
              },
            },
          ],
        },
      },
      {
        header: {
          color: '--color-bg-pastel-green',
          template: `
              <div class="start-dose-ready-to-inject__content">
                <h1 class="font-heading-1--bold">Uncap injector.</h1>
                <img src="assets/images/start-dose-ready-to-inject-uncap.svg">
                <div class="pro-tip">
                    <ion-icon name="information-circle-outline"></ion-icon>
                    <h5><strong>Pro Tip</strong></h5>
                    <p>
                      <ng-container>
                        The status light will turn green after the cap is removed to show that it's ready to inject.
                      </ng-container>
                    </p>
                   </div>
                </div>
            `,
        },
        content: {
          blockNavigationFor: null,
          actions: [
            {
              label: 'Previous step',
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-blue'
                  )
                );
                this.sliderPage.slidePrev();
              },
            },
            {
              label: 'Next Step',
              disabled: !this.readyForInjection,
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-beige'
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
          color: '--color-bg-pastel-beige',
          template: `
              <div class="start-dose-ready-to-inject__content">
                <h1 class="font-heading-1--bold">Almost there...</h1>
              </div>
            `,
          cards: [
            {
              type: 'stepper',
              indicator: '1',
              title: 'To inject, firmly press and hold down',
              asset: '/assets/images/start-dose-ready-to-inject-card-1.svg',
              description:
                'On the next screen, press the injector against skin until it <strong>clicks</strong>.  The light will turn <strong>purple</strong> while injecting.',
            },
            {
              type: 'stepper',
              indicator: '2',
              title: 'Hold down for 10 seconds',
              asset: '/assets/images/start-dose-ready-to-inject-card-2.svg',
              description:
                'The injection will take <strong>10 seconds</strong> to complete. Hold down for the entire time.',
            },
            {
              type: 'stepper',
              indicator: '3',
              title: 'Green means finished',
              asset: '/assets/images/start-dose-ready-to-inject-card-3.svg',
              description:
                'The light will turn <strong>green</strong> when the injection is complete and you can safely release.',
            },
          ],
        },
        content: {
          actions: [
            {
              label: 'Previous step',
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-green'
                  )
                );
                this.sliderPage.slidePrev();
              },
            },
            {
              label: 'Next Step',
              action: () => {
                this.sliderPage.slideNext();
              },
            },
          ],
        },
        onLoad: () => {
          if (this.homeConfig.firstTimeDose) {
            this.startWaitingForStartDosing();
          }
        },
      }
    );
    // }

    // set dosing step
    this.slides.push(
      {
        header: {
          color: '--color-bg-pastel-honey-yellow',
          fullSize: true,
          template: null,
          component: 'start-dose-ready-to-inject-waiting-to-start-injection',
        },
        content: {
          hide: true,
        },
        onLoad: () => {
          // Mock injection
          this._store.dispatch(
            new fromBluetoothStore.StartMockScenario(
              MOCK_SCENARIO_IDS.START_INJECTION_HAPPY_PATH
              // MOCK_SCENARIO_IDS.START_INJECTION_INCOMPLETE_PATH
            )
          );

          if (!this.homeConfig.firstTimeDose || this.homeConfig.dosingError) {
            this.startWaitingForStartDosing();

            if (this.homeConfig.dosingError) {
              this._store.dispatch(
                new fromStore.SetData({
                  dosingError: false,
                })
              );
            }
          }
        },
      },
      {
        header: {
          color: '--color-bg-pastel-purple',
          fullSize: false,
          component: 'start-dose-ready-to-inject-dosing',
        },
        content: {
          hide: true,
        },
      },
      {
        content: {
          isExpanded: true,
          bgColor: '--color-bg-pastel-beige',
          template: `
            <div class="start-dose-ready-to-inject-waiting-to-start-injection">
              <h1 class="font-heading-1--bold">Plunger is retracting...</h1>
              <img src="assets/images/plunger-retracting.svg">
              <p>You will hear a motor sound while the plunger is retracting.</p>
              <p>Do not attempt to remove the cassette until the plunger is fully retracted.</p>
              <div class="loader"></div>
            </div>
          `,
        },
        onLoad: () => {
          this._store
            .select(fromBluetoothStore.isRemoveCassetteState)
            .pipe(
              takeUntil(this.ngUnsubscribe),
              filter((isRemoveCassetteState) => isRemoveCassetteState),
              take(1)
            )
            .subscribe(() => {
              this.goTo('/home/cassette-remove');
              this._store.dispatch(new fromSharedStore.AlertHide());
            });
        },
      }
    );
  }

  playVideo() {
    const continueButtonOnSliderPage = document.querySelector(
      '.slider-page .wrapper-small .swiper-slide-active .actions-wrapper ion-button.is-hidden'
    ) as HTMLElement;
    continueButtonOnSliderPage?.click();
  }

  showNoNeedlessMessage() {
    this._store.dispatch(
      new fromSharedStore.BackdropShow({
        transition: 'move',
        header: true,
        contentCentered: true,
        showBackButton: false,
        template: `
        <div class="no-needless-message">
          <h1 class="font-heading-1--bold">No needles and no drugs</h1>
          <p>This demo unit does not have a needle nor drug substance.</p>
          <p>Feel free to act like a real patient and press this against your leg when instructed.</p>
          <img src="assets/images/no-needles.svg">
        </div>
      `,
      })
    );
  }

  async startWaitingForStartDosing() {
    try {
      this._store.dispatch(
        new fromSharedStore.TopbarChangeColor('--color-transparent')
      );

      this.isInjecting$
        .pipe(takeUntil(this.ngUnsubscribe), filter(Boolean))
        .subscribe(() => {
          if (this.homeConfig.firstTimeDose) {
            if (
              this.sliderPageConfig?.header.currentSlide ===
              FirstTimeSlides.AlmostThere
            ) {
              this._store.dispatch(
                new fromSharedStore.SliderPageSetHeaderOptions({
                  template: null,
                })
              );
              this.sliderPage.slideTo(FirstTimeSlides.Dosing);
            } else {
              this.sliderPage.slideNext();
            }
          } else {
            this.sliderPage.slideNext();
          }

          this._store.dispatch(
            new fromStore.SetData({
              dosingStarted: true,
            })
          );
        });
    } catch (error) {
      console.log('startWaitingForStartDosing > error: ', error);
    }
  }
}
