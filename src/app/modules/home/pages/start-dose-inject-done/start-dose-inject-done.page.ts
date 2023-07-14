import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
                this.sliderPage.slideNext();
              },
            },
            {
              label: 'Done',
              action: () => { 
                this.finishStep();
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
                label: 'Cool!',
                // disabled: true,
                action: () => {
                  this.finishStep();
                },
              },
            ]
          } 
        }
      }
    ];
  }

  ngOnInit() {
    this.sliderPageConfig$.subscribe(sliderPageConfig => {
      if (sliderPageConfig) {
        this.sliderPageConfig = sliderPageConfig;
      }
    });

    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;

        if (this.homeConfig.firstTimeDose) {
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
                hideNavigation: true,
                actions: [
                  {
                    label: 'Got it',
                    action: () => {
                      this._store.dispatch(new fromSharedStore.BackdropShow({
                        transition: 'move',
                        fullScreen: true,
                        header: true,
                        bgTemplate: 'top-hole',
                        template: `
                        <div class="start-dose-inject-done">
                            <h1 class="font-heading-1--bold">Do not discard!</h1>
                            <p>We will reuse this connected autoinjector for future demonstrations</p>
                            <ion-button fill="outline" expand="block" color="light" onclick="window.backdropComponent.close()">
                              Got it
                            </ion-button>
                          </div>
                        `,
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
                    title: 'January 14th',
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
                      this._store.dispatch(new fromSharedStore.SliderPageClear());
                      this._store.dispatch(new fromCoreStore.Go({
                        path: ['/home']
                      }));
      
                      setTimeout(() => {
                        this._store.dispatch(new fromSharedStore.AlertShow({
                          mode: 'full',
                          template: `
                            <img src="assets/images/alert-setup-reminders.svg" />
                            <h1 class="font-heading-1--bold">Smart reminders saved</h1>
                            <p>AutoMagic will learn from your selections to improve recommendations.</p>
                          `,
                          actions: [
                            {
                              label: 'Ok, let’s go!',
                              action: () => {
                                this._store.dispatch(new fromSharedStore.AlertClose());
                                this._store.dispatch(new fromStore.SetData({
                                  firstTimeDose: this.homeConfig.firstTimeDose ? false : this.homeConfig.firstTimeDose
                                }));
                              },
                            }
                          ],
                        }));
                      }, 500);
                    }
                  }
                ],
              },
            },
          );
        }

        const markedDoses = this.homeConfig?.doses.filter((dose: any) => dose.marked);
        // if the first one dose was injected, for the demo purpose we'll fill 
        // automatically 5 doses to leave the user in the last dose
        if (markedDoses.length === 1) {
          setTimeout(() => {
            this._store.dispatch(new fromStore.SetData({
              doses: this.homeConfig.doses.map((dose: any, index: number) => {
                return {
                  marked: index + 1 < this.homeConfig.doses.length 
                    ? true 
                    : false,
                  date: index + 1 < this.homeConfig.doses.length 
                    ? moment().add(index, 'week').toString() 
                    : '',
                }
              }),
            }));
          }, 5000);
        }

        if (this.homeConfig.doses.length === 6) {
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
                    },
                  },
                ]
              } 
            }
          });
        }

        if (markedDoses.length === 6) {
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
                    },
                  },
                ]
              } 
            }
          });
        }
      }
    });
  }

  finishStep() {
    this._store.dispatch(new fromSharedStore.SliderPageClear());
    this.goTo('home');

    if (this.homeConfig.firstTimeDose) {
      setTimeout(() => {
        this._store.dispatch(new fromSharedStore.AlertShow({
          mode: 'full',
          template: `
            <img src="assets/images/alert-setup-reminders.svg" />
            <h1 class="font-heading-1--bold">Smart reminders saved</h1>
            <p>AutoMagic will learn from your selections to improve recommendations.</p>
          `,
          actions: [
            {
              label: 'Ok, let’s go!',
              action: () => {
                this._store.dispatch(new fromSharedStore.AlertClose());
                this._store.dispatch(new fromStore.SetData({
                  firstTimeDose: this.homeConfig.firstTimeDose ? false : this.homeConfig.firstTimeDose
                }));
              },
            }
          ],
        }));
      }, 500);
    }
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
