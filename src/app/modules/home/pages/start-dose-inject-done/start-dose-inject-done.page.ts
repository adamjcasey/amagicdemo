import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@home/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedComponents from '@shared/components';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-inject-done',
  templateUrl: 'start-dose-inject-done.page.html',
  styleUrls: ['start-dose-inject-done.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseInjectDonePage implements OnInit {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public slides: Array<any> = [];
  @ViewChild('sliderPage', { static: false }) sliderPage!: fromSharedComponents.SliderPageComponent;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.slides = [
      {
        header: {
          color: '--color-bg-pastel-honey-yellow',
          component: 'start-dose-inject-done-progress',
        },
        content: {
          hideNavigation: true,
          actions: [
            {
              label: 'Add dose notes',
              action: () => {
                this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-white'));
                this.sliderPage.slideNext();
              },
            },
            {
              label: 'Done',
              action: () => { 
                const markedDoses = this.homeConfig?.doses.filter((dose: any) => dose.marked);
                if (this.homeConfig.firstTimeDose || markedDoses.length === 6) {
                  this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint'));
                  this.sliderPage.slideTo(2);
                }
                else {
                  this.goTo('home');
                  this._store.dispatch(new fromSharedStore.SliderPageClear());
                }
              }
            }
          ],
        },
      },
      {
        content: {
          isExpanded: true,
          component: 'start-dose-inject-dose-notes',
          toolbar: { 
            actions: [
              {
                label: 'Skip',
                action: (event: any) => {
                  this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint'));
                  event.target.nextElementSibling.click();
                },
              },
              {
                label: 'Proceed',
                // disabled: true,
                action: () => {
                  this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint'));
                  if (this.homeConfig.firstTimeDose) {
                    this.sliderPage.slideNext();
                  }
                  else {
                    const markedDoses = this.homeConfig?.doses.filter((dose: any) => dose.marked);
                    if (markedDoses.length === 6) {
                      this.sliderPage.slideNext();
                    }
                    else {
                      this.goTo('home');
                      this._store.dispatch(new fromSharedStore.SliderPageClear());
                    }
                  }
                },
              },
            ]
          } 
        }
      }
    ];
  }

  ngOnInit() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-honey-yellow'));
    this.sliderPageConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(sliderPageConfig => {
        if (sliderPageConfig) {
          this.sliderPageConfig = sliderPageConfig;
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;

          // if this is the first dose to be injected, add extra instructions (slides)
          if (this.homeConfig.firstTimeDose) {
            if (this.slides.length === 2) {
              const nextDose = this.homeConfig.doses[1];
              this.slides.push(
                {
                  header: {
                    color: '--color-bg-pastel-mint',
                    template: `
                      <div class="start-dose-inject-done">
                        <h1 class="font-heading-1--bold">Replace safety cap.</h1>
                        <img src="assets/images/start-dose-inject-done-replace-cap.gif">
                      </div>
                    `,
                  },
                  content: {
                    isExpanded: false,
                    hideNavigation: true,
                    actions: [
                      {
                        label: 'Got it',
                        action: () => {
                          this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue'));
                          this._store.dispatch(new fromSharedStore.BackdropShow({
                            transition: 'move',
                            fullScreen: true,
                            header: true,
                            bgTemplate: 'top-hole',
                            template: `
                              <div class="start-dose-inject-done">
                                <h1 class="font-heading-1--bold">Do not discard!</h1>
                                <p>We will reuse this connected autoinjector for future demonstrations</p>
                              </div>
                            `,
                            buttons: [
                              {
                                label: 'Got it',
                                action: () => {
                                  this._store.dispatch(new fromSharedStore.BackdropClose());
                                },
                              }
                            ]
                          }));
                          this.sliderPage.slideNext();
                        }
                      }
                    ],
                  },
                },
                {
                  header: {
                    color: '--color-bg-pastel-blue',
                    template: `
                      <div class="start-dose-inject-done">
                        <h1 class="font-heading-1--bold">Safely discard injector.</h1>
                        <img src="assets/images/start-dose-inject-done-discard-inject.svg">
                        <div class="pro-tip">
                          <ion-icon name="information-circle-outline"></ion-icon>
                          <p><strong>Pro Tip</strong></p>
                          <p>Discard injector in your sharps “take-back” bin for recycling.</p>
                        </div>
                      </div>
                    `,
                  },
                  content: {
                    hideNavigation: true,
                    actions: [
                      {
                        label: 'Got it',
                        action: () => { 
                          this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green'));
                          this.sliderPage.slideNext();
                        }
                      }
                    ],
                  },
                },
                {
                  header: {
                    color: '--color-bg-pastel-green',
                    template: `
                      <div class="start-dose-inject-done">
                        <h1 class="font-heading-1--bold">Next Dose</h1>
                      </div>
                    `,
                    cards: [
                      {
                        type: 'featured',
                        eyebrow: 'Next Dose:',
                        title: moment(nextDose.date).format('MMMM Do'),
                        asset: '/assets/images/start-dose-inject-done-drug.svg',
                        button: {
                          label: 'Edit schedule',
                          fill: 'outline',
                        }
                      },
                      {
                        title: 'Like a smart reminder?',
                        asset: '/assets/images/start-dose-inject-done-notification.svg',
                        description: 'Smart reminders can notify you at the right time and place by using calendar and location data to improve recommendations.',
                      }
                    ],
                  },
                  content: {
                    hideNavigation: true,
                    actions: [
                      {
                        label: 'Set up smart reminders',
                        action: () => {
                          this.goTo('settings/setup-reminders');
                          this._store.dispatch(new fromSharedStore.SliderPageClear());
                        }
                      }
                    ],
                  },
                },
              );
            }
          }

          const markedDoses = this.homeConfig?.doses.filter((dose: any) => dose.marked);
          // if the user has completed the 6 doses we will show the Dose report
          if (markedDoses.length === 6) {
            if (this.slides.length === 2) {
              this.slides.push({
                content: {
                  isExpanded: true,
                  component: 'start-dose-inject-done-report',
                  toolbar: { 
                    actions: [
                      {
                        label: 'Cool!',
                        action: () => {
                          this.goTo('home');
                          this._store.dispatch(new fromSharedStore.SliderPageClear());
                        },
                      },
                    ]
                  } 
                }
              });
            }
          }
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
