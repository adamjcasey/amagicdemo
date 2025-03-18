import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom, Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BluetoothService } from '@app/shared/libs/bluetooth';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import { IonContent } from '@ionic/angular/standalone';
import * as fromSharedComponents from '@shared/components';
import * as fromSharedStore from '@shared/store';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';

@Component({
  selector: 'automagic-start-dose-prepare',
  templateUrl: 'start-dose-prepare.page.html',
  styleUrls: ['start-dose-prepare.page.scss'],
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
export class StartDosePreparePage implements OnInit, OnDestroy {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public slides: Array<any> = [];
  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;
  public sliderPageConfig$!: Observable<any>;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _bluetoothService: BluetoothService
  ) {
    addIcons({ closeCircle, checkmarkCircle });

    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.sliderPageConfig$ = this._store.select(
      fromSharedStore.getSliderPageConfig
    );
    this.slides = [
      {
        header: {
          color: '--color-white',
        },
        content: {
          isExpanded: true,
          hide: false,
          hideNavigation: true,
          template:
            this.homeConfig?.firstTimeDose || true
              ? `
          <div class="start-dose-prepare__instructions">
            <img src="assets/images/drug-cold-temp.svg" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Theryx® temperature</h1>

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
        `
              : `
          <div class="start-dose-prepare__instructions">
            <img src="assets/images/drug-cold-temp.svg" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Theryx® temperature</h1>

            <div class="temperature-status">
              <p class="indicator green">
                68°
                <span>Current</span>
              </p>
            </div>
            <h3>Theryx® is warm enough for a comfortable injection.</h3>
            <p>Good job taking it out of the fridge ahead of time!</p>
          </div>
        `,
          actions: [
            {
              label: 'Proceed',
              action: () => {
                this.showStepTempTimer();
              },
            },
          ],
        },
      },
    ];
  }

  ngOnInit() {
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-white')
    );

    // Subscribe to connection state changes
    this._bluetoothService.connected$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(async (isConnected) => {
        if (!isConnected) {
          // Get current slide from the config
          const currentConfig = await firstValueFrom(this.sliderPageConfig$);
          if (currentConfig?.header?.currentSlide > 2) {
            // If device disconnects after we've moved past the connection slides,
            // go back to the Theryx info slide and attempt to reconnect
            this.sliderPage.slideTo(2);
            await this._bluetoothService.isDeviceConnected();
          }
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          const markedDoses = this.homeConfig.doses.filter(
            (dose: any) => dose.marked
          );
          if (markedDoses.length === 1) {
            this._store.dispatch(
              new fromStore.SetData({
                doses: this.homeConfig.doses.map((dose: any, index: number) => {
                  return {
                    ...dose,
                    bodyPartInjected: markedDoses[0].bodyPartInjected,
                    marked:
                      index + 1 < this.homeConfig.doses.length ? true : false,
                  };
                }),
              })
            );
          }
        }
      });

    this.layoutConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((layoutConfig) => {
        if (layoutConfig) {
          this.layoutConfig = layoutConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  async slideNext(sliders: any) {
    sliders.asset.slideNext(500);
    sliders.content.slideNext(500);

    const currentSlide = sliders.content.activeIndex;
    if (currentSlide === 1) {
      try {
        // Start the connection process
        const isDeviceConnected =
          await this._bluetoothService.isDeviceConnected();

        if (isDeviceConnected) {
          // Wait a bit for animations to complete
          await new Promise((resolve) => setTimeout(resolve, 500));
          this.sliderPage.slideNext();
        } else {
          // If connection failed, show error state
          this._store.dispatch(
            new fromSharedStore.SliderPageSetContentOptions({
              template: `
                <div class="start-dose-prepare__connecting">
                  <h1 class="font-heading-1--bold">Connection failed</h1>
                  <p>Please make sure your device is nearby and powered on.</p>
                </div>
              `,
            })
          );
        }
      } catch (error: any) {
        if (this.layoutConfig.debuggingDeviceMode) {
          this._bluetoothService.logger(
            'isDeviceConnected service method Error',
            error
          );
        }
      }
    }
  }

  showStepTemperature = () => {
    // hold on a few ms the change of the topbar bgcolor to match with the opening
    // of the expanded box in SlidePage component
    setTimeout(() => {
      this._store.dispatch(
        new fromSharedStore.TopbarChangeColor('--color-white')
      );
    }, 500);
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContent({
        isExpanded: true,
        template: this.homeConfig.firstTimeDose
          ? `
          <div class="start-dose-prepare__instructions">
            <img src="assets/images/drug-cold-temp.svg" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Theryx® temperature</h1>

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
        `
          : `
          <div class="start-dose-prepare__instructions">
            <img src="assets/images/drug-cold-temp.svg" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Theryx® temperature</h1>

            <div class="temperature-status">
              <p class="indicator green">
                68°
                <span>Current</span>
              </p>
            </div>
            <h3>Theryx® is warm enough for a comfortable injection.</h3>
            <p>Good job taking it out of the fridge ahead of time!</p>
          </div>
        `,
        toolbar: {
          actions: [
            {
              label: 'Proceed',
              action: () => {
                if (this.homeConfig.firstTimeDose) {
                  this.showStepTempTimer();
                } else {
                  this.sliderPage.slideNext();
                  this.showStepInspect();
                }
              },
            },
          ],
        },
      })
    );
  };

  showStepTempTimer() {
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContentOptions({
        template: null,
        component: 'start-dose-prepare-temp-timer',
        toolbar: {
          actions: [
            {
              label: "Ok, let's go!",
              // setting as disabled to avoid user unnecessary action,
              // will be enable after show Dose setup view
              disabled: true,
              action: () => {
                this.showStepInspect();
              },
            },
          ],
        },
      })
    );
  }

  showStepInspect() {
    // TODO: resolve ion-icons
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContentOptions({
        component: null,
        template: `
        <div class="start-dose-prepare__instructions">
          <img src="assets/images/drug-window.svg" />
          <h1 class="font-heading-1--bold ion-text-nowrap">Inspect your Theryx®</h1>
          <div class="inspection">
            <div class="statement incorrect">
              <h3>
                <!-- <ion-icon name="close-circle"></ion-icon> -->
                Do not proceed if it is
              </h3>
              <p>Cloudy</p>
              <p>Has floating specks</p>
              <p>Has turned yellow</p>
            </div>

            <div class="statement correct">
              <h3>
                <!-- <ion-icon name="checkmark-circle"></ion-icon> -->
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
              cssClasses: 'dispatch-hotspots hotspot-element--cancel',
            },
            {
              label: 'Looks good',
              action: () => {
                if (this.homeConfig.firstTimeDose) {
                  this.showStepSurvey();
                } else {
                  this._store.dispatch(new fromSharedStore.SliderPageClear());
                  this.goTo('home/start-dose/ready-to-inject');
                }
              },
            },
          ],
        },
      })
    );
  }

  showStepSurvey() {
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContentOptions({
        template: `
        <div class="start-dose-prepare__survey">
          <h1 class="font-heading-1--bold">While you are waiting, how are you feeling?</h1>
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
            },
          ],
        },
      })
    );
  }

  showStepWaitingToInject() {
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContentOptions({
        template: null,
        component: 'start-dose-prepare-waiting-to-inject',
        toolbar: {
          actions: [
            {
              label: "Ok, let's go!",
              // button will be disabled until finish the timer
              disabled: true,
            },
          ],
        },
      })
    );
  }

  goTo(path: string) {
    this._store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }
}
