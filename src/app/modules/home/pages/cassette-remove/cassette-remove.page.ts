import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, take, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceStateCode } from '@app/shared/libs/bluetooth';
import { MOCK_SCENARIO_IDS } from '@app/shared/libs/bluetooth/constants/bluetooth-mock.constants';
import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import { getSuccessfulDoses } from '@app/shared/libs/bluetooth/store';
import { getLastInjection } from '@app/shared/libs/bluetooth/store/bluetooth.reducer';
import * as fromHomeStore from '@home/store';
import { IonContent } from '@ionic/angular/standalone';
import { BaseComponentAbstract } from '@shared/abstracts/base-component.abstract';
import * as fromSharedComponents from '@shared/components';
import * as fromSharedStore from '@shared/store';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';

export enum CassetteRemoveSlides {
  RemoveCassete = 0,
  DiscardInjection = 1,
}

@Component({
  selector: 'automagic-cassette-remove',
  templateUrl: 'cassette-remove.page.html',
  styleUrls: ['cassette-remove.page.scss'],
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
export class CassetteRemovePage
  extends BaseComponentAbstract
  implements AfterViewInit
{
  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;

  homeConfig$: Observable<any> = this.store.select(fromHomeStore.getHomeConfig);
  homeConfig: any;

  getSuccessfulDoses$: Observable<number> =
    this.store.select(getSuccessfulDoses);

  lastInjection$: Observable<string> = this.store.select(getLastInjection);

  deviceState$: Observable<number> = this.store.select(
    fromBluetoothStore.getDeviceState
  );

  slides: Array<any> = [
    {
      content: {
        isExpanded: true,
        hide: false,
        hideNavigation: true,
        bgColor: '--color-bg-pastel-green-dark',
        template: `
          <section class="cassette-remove">
            <img src="assets/images/cassette-remove.gif" alt="Cassette removal" class="cassette-remove__image" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Remove the old<br>cassette</h1>
            <p>You will hear a confirmation chime indicating that the cassette has been removed.</p>
            <div class="loader"></div>
          </section>
        `,
      },
    },
    {
      content: {
        isExpanded: true,
        hideNavigation: true,
        blockNavigationFor: 2000,
        bgColor: '--color-bg-pastel-blue',
        toolbar: {
          actions: [
            {
              label: 'Got it',
              action: () => {
                this.sliderPage.slideNext();
                this.#handleCloseAction();
              },
            },
          ],
        },
        template: `
          <div class="cassette-remove">
            <h1 class="font-heading-1--bold">Safely discard the cassette and cap.</h1>
            <img src="assets/images/cassette-discard-injection.svg">
            <div class="pro-tip">
              <p><ion-icon name="information-circle-outline"></ion-icon><strong>Pro Tip</strong></p>
              <p>Discard cassette in your sharps “take-back” bin for recycling.</p>
            </div>
          </div>
        `,
      },
    },
  ];

  constructor() {
    super();
    addIcons({
      informationCircleOutline,
    });

    this.store.dispatch(
      new fromBluetoothStore.StartMockScenario(
        MOCK_SCENARIO_IDS.CASSETTE_REMOVE_HAPPY_PATH
      )
    );

    this.homeConfig$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((homeConfig) => {
        this.homeConfig = homeConfig;
      });
  }

  ngAfterViewInit() {
    this.#initStateSubscriptions();
  }

  slideNext(sliders: any) {
    sliders.asset.slideNext(500);
    sliders.content.slideNext(500);
  }

  #initStateSubscriptions() {
    this.deviceState$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((deviceState) => {
        if (deviceState === DeviceStateCode.PoweringOff) {
          this.#handleDisposeCassette();
        } else {
          this.#handleCassetteRemove();
        }
      });
  }

  #handleCassetteRemove(): void {
    console.log('Navigating to RemoveCassette slide');
    this.sliderPage.slideTo(CassetteRemoveSlides.RemoveCassete);
  }

  #handleDisposeCassette(): void {
    const currentSlideIndex = this.sliderPage.config.content.currentSlide;

    if (currentSlideIndex <= CassetteRemoveSlides.DiscardInjection) {
      return;
    }

    console.log('Navigating to DiscardInjection slide');
    this.sliderPage.slideTo(CassetteRemoveSlides.DiscardInjection);

    if (this.homeConfig.onBoardingDone) {
      this.#showDoNotDiscardBackdrop();
    }
  }

  #showDoNotDiscardBackdrop(): void {
    setTimeout(() => {
      this.store.dispatch(
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
                this.store.dispatch(new fromSharedStore.BackdropHide());
                this.#handleCloseAction();
              },
            },
          ],
        })
      );
    }, 1000);
  }

  #handleCloseAction(): void {
    this.lastInjection$.pipe(take(1)).subscribe((lastInjection) => {
      if (this.homeConfig.onBoardingDone || lastInjection !== 'COMPLETE') {
        this.store.dispatch(new fromSharedStore.SliderPageClear());
        this.goTo('/home');
      } else {
        this.getSuccessfulDoses$
          .pipe(takeUntil(this.ngUnsubscribe), take(1))
          .subscribe((count) => {
            if (count === 0) {
              this.goTo('/home/cassette-journey');
            } else {
              this.store.dispatch(new fromSharedStore.SliderPageClear());
              this.goTo('/home/start-dose/inject-done');
            }
          });
      }
    });
  }
}
