import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { Observable, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import { IonContent } from '@ionic/angular/standalone';
import { DeviceConnectionAbstract } from '@shared/abstracts/device-connection.abstract';
import * as fromSharedComponents from '@shared/components';
import * as fromSharedStore from '@shared/store';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'automagic-start-dose-inject-done',
  templateUrl: 'start-dose-inject-done.page.html',
  styleUrls: ['start-dose-inject-done.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    fromSharedComponents.SliderPageComponent,
    IonContent,
  ],
})
export class StartDoseInjectDonePage
  extends DeviceConnectionAbstract
  implements OnInit
{
  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;

  homeConfig$: Observable<any> = this._store.select(fromStore.getHomeConfig);
  homeConfig: any;
  sliderPageConfig$: Observable<any> = this._store.select(
    fromSharedStore.getSliderPageConfig
  );
  sliderPageConfig: any;
  slides: Array<any> = [
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
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-white')
              );
              this.sliderPage.slideNext();
            },
          },
          {
            label: 'Done',
            action: () => {
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint')
              );
              this.sliderPage.slideTo(2);
            },
          },
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
                if (this.homeConfig.firstTimeDose) {
                  this._store.dispatch(
                    new fromSharedStore.TopbarChangeColor(
                      '--color-bg-pastel-mint'
                    )
                  );
                } else {
                  const markedDoses = this.homeConfig?.doses.filter(
                    (dose: any) => dose.marked
                  );
                  if (markedDoses.length === 6) {
                    this._store.dispatch(
                      new fromSharedStore.TopbarChangeColor('--color-white')
                    );
                  }
                }
                this.store.dispatch(new fromSharedStore.SliderPageClear());
                event.target.nextElementSibling.click();
              },
            },
            {
              label: 'Proceed',
              // disabled: true,
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-mint'
                  )
                );
                this.store.dispatch(new fromSharedStore.SliderPageClear());
                this.sliderPage.slideTo(2);
              },
            },
          ],
        },
      },
    },
  ];

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    super();
    addIcons({ informationCircleOutline });
  }

  ngOnInit() {
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-bg-pastel-honey-yellow')
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

          this.updateNextDoseSlideTitle(homeConfig);

          // add extra instructions (slides)
          if (this.slides.length === 2) {
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
                        this._store.dispatch(
                          new fromSharedStore.TopbarChangeColor(
                            '--color-bg-pastel-blue'
                          )
                        );
                        this.sliderPage.slideNext();
                        setTimeout(() => {
                          this._store.dispatch(
                            new fromSharedStore.BackdropShow({
                              transition: 'move',
                              fullScreen: true,
                              header: true,
                              bgTemplate: 'top-hole',
                              showBackButton: false,
                              template: `
                              <div class="start-dose-inject-done-message">
                                <h1 class="font-heading-1--bold">Do not discard!</h1>
                                <p>We will reuse this connected autoinjector for future demonstrations</p>
                              </div>
                            `,
                              buttons: [
                                {
                                  label: 'Got it',
                                  action: () => {
                                    this._store.dispatch(
                                      new fromSharedStore.BackdropHide()
                                    );
                                  },
                                },
                              ],
                            })
                          );
                        }, 1500);
                      },
                    },
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
                  blockNavigationFor: 2000,
                  actions: [
                    {
                      label: 'Got it',
                      action: () => {
                        const markedDoses = this.homeConfig?.doses.filter(
                          (dose: any) => dose.marked
                        );
                        if (this.homeConfig.firstTimeDose) {
                          this._store.dispatch(
                            new fromSharedStore.TopbarChangeColor(
                              '--color-bg-pastel-green'
                            )
                          );
                          this.sliderPage.slideNext();
                        } else if (markedDoses.length === 6) {
                          this._store.dispatch(
                            new fromSharedStore.TopbarChangeColor(
                              '--color-white'
                            )
                          );
                          this.sliderPage.slideNext();
                        } else {
                          this.goTo('home');
                          this._store.dispatch(
                            new fromSharedStore.SliderPageClear()
                          );
                        }
                      },
                    },
                  ],
                },
              }
            );

            if (this.homeConfig.firstTimeDose) {
              const nextDose = this.homeConfig.doses[1];
              this.slides.push({
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
                      },
                    },
                    {
                      title: 'Like a smart reminder?',
                      cssClasses: 'hotspot-element',
                      asset:
                        '/assets/images/start-dose-inject-done-notification.svg',
                      description:
                        'Smart reminders can notify you at the right time and place by using calendar and location data to improve recommendations.',
                    },
                  ],
                },
                content: {
                  hideNavigation: true,
                  blockNavigationFor: null,
                  actions: [
                    {
                      label: 'Set up smart reminders',
                      action: () => {
                        this.goTo('settings/setup-reminders');
                        this._store.dispatch(
                          new fromSharedStore.SliderPageClear()
                        );
                      },
                    },
                  ],
                },
              });
            }
          }

          // if the user has completed the 6 doses we will show the Dose report
          const markedDoses = this.homeConfig?.doses.filter(
            (dose: any) => dose.marked
          );
          if (markedDoses.length === 6) {
            this.slides.push({
              content: {
                isExpanded: true,
                component: 'start-dose-inject-done-report',
                blockNavigationFor: null,
                toolbar: {
                  actions: [
                    {
                      label: 'Cool!',
                      action: () => {
                        this.goTo('home');
                        this._store.dispatch(
                          new fromSharedStore.SliderPageClear()
                        );
                      },
                    },
                  ],
                },
              },
            });
          }
        }
      });

    this.setDoses();
  }

  setDoses(): void {
    if (Capacitor.isNativePlatform()) {
      setTimeout(async () => {
        const storage: any = environment.db;
        const saveState = (await storage.get('state')) as string;
        const saveDoses = (await storage.get('doses')) as string;

        this.dispatchDosesIfDataMissing(saveDoses, saveState);
      });
    } else {
      const saveState = localStorage.getItem('state') as string;
      const saveDoses = localStorage.getItem('doses') as string;

      this.dispatchDosesIfDataMissing(saveDoses, saveState);
    }
  }

  dispatchDosesIfDataMissing(saveDoses: string, saveState: string): void {
    const state = JSON.parse(saveState);
    const doses = JSON.parse(saveDoses);
    const lastIndex = doses?.length - 1;
    const lastDoseDate = doses?.[lastIndex]?.date;

    if (lastDoseDate && !state.home?.doses?.[lastIndex]?.date) {
      this._store.dispatch(
        new fromStore.SetData({ firstTimeDose: !doses[0]?.marked, doses })
      );
    }
  }

  updateNextDoseSlideTitle(homeConfig: any): void {
    const nextDoseSlide = this.slides[4];

    if (nextDoseSlide && homeConfig.firstTimeDose) {
      nextDoseSlide.header.cards[0].title = moment(
        homeConfig.doses[1].date
      ).format('MMMM Do');
    }
  }
}
