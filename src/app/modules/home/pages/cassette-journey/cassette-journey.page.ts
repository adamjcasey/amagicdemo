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
  selector: 'automagic-cassette-journey',
  templateUrl: 'cassette-journey.page.html',
  styleUrls: ['cassette-journey.page.scss'],
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
export class CassetteJourneyPage implements OnInit, OnDestroy {
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
          asset: '/assets/images/cassette-verified.svg',
        },
        content: {
          isExpanded: true,
          hide: false,
          hideNavigation: true,
          toolbar: {
            actions: [
              {
                label: 'Proceed',
                action: () => {
                  this.goTo('/home/start-dose/prepare');
                },
              },
            ],
          },
          template: `
            <div class="start-dose-prepare__instructions">
              <img src="assets/images/cassette-verified.svg" />
              <h1 class="font-heading-1--bold ion-text-nowrap">Cassette is verified</h1>
              <p>Your cassette passed the authenticity and expiration checks.</p>
            </div>
          `,
          cards: [
            {
              asset: '/assets/images/dose.svg',
              title: 'Theryx®, 80mg',
              description: 'Synthesized in Dayton, OH on 05/04/2023',
              disclamerText: 'Expires 06/24/2024',
            },
          ],
        },
      },
    ];
  }

  ngOnInit() {
    // this._store.dispatch(
    //   new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple')
    // );

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

    // this.homeConfig$
    //   .pipe(takeUntil(this._ngUnsubscribe))
    //   .subscribe((homeConfig) => {
    //     if (homeConfig) {
    //       this.homeConfig = homeConfig;
    //       const markedDoses = this.homeConfig.doses.filter(
    //         (dose: any) => dose.marked
    //       );
    //       if (markedDoses.length === 1) {
    //         this._store.dispatch(
    //           new fromStore.SetData({
    //             doses: this.homeConfig.doses.map((dose: any, index: number) => {
    //               return {
    //                 ...dose,
    //                 bodyPartInjected: markedDoses[0].bodyPartInjected,
    //                 marked:
    //                   index + 1 < this.homeConfig.doses.length ? true : false,
    //               };
    //             }),
    //           })
    //         );
    //       }
    //     }
    //   });

    // this.layoutConfig$
    //   .pipe(takeUntil(this._ngUnsubscribe))
    //   .subscribe((layoutConfig) => {
    //     if (layoutConfig) {
    //       this.layoutConfig = layoutConfig;
    //     }
    //   });
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

  goTo(path: string) {
    this._store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }
}
