import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, filter, Observable, take, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceStateCode } from '@app/shared/libs/bluetooth';
import { MOCK_SCENARIO_IDS } from '@app/shared/libs/bluetooth/constants/bluetooth-mock.constants';
import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import { getMockScenariosHistory } from '@app/shared/libs/bluetooth/store/bluetooth.reducer';
import { IonContent } from '@ionic/angular/standalone';
import { DeviceConnectionAbstract } from '@shared/abstracts/device-connection.abstract';
import * as fromSharedComponents from '@shared/components';
import * as fromSharedStore from '@shared/store';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  checkmarkCircle,
  closeCircle,
  informationCircle,
} from 'ionicons/icons';

export enum CassetteJourneySlides {
  InspectCassette = 0,
  InsertCassette = 1,
  CheckCassette = 2,
  CassetteVerified = 3,
}

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
export class CassetteJourneyPage
  extends DeviceConnectionAbstract
  implements AfterViewInit
{
  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;

  isCassetteInsertionRequired$: Observable<boolean> = this.store.select(
    fromBluetoothStore.isCassetteInsertionRequiredState
  );
  isCassetteBeingPrepared$: Observable<boolean> = this.store.select(
    fromBluetoothStore.isCassetteBeingPreparedState
  );
  isCassetteVerified$: Observable<boolean> = this.store.select(
    fromBluetoothStore.isCassetteVerifiedState
  );
  isCassetteLoadingError$: Observable<boolean> = this.store.select(
    fromBluetoothStore.isCassetteLoadingErrorState
  );
  isCassetteExpired$: Observable<boolean> = this.store.select(
    fromBluetoothStore.isCassetteExpiredState
  );

  mockScenariosHistory$ = this.store.select(getMockScenariosHistory);

  slides: Array<any> = [
    {
      content: {
        isExpanded: true,
        hide: false,
        hideNavigation: true,
        bgColor: '--color-white',
        toolbar: {
          actions: [
            {
              label: 'Looks good',
              action: () => {
                this.sliderPage.slideNext();

                this.#mockScenario();
              },
            },
          ],
        },
        template: `
          <section class="cassette-inspection">
            <img class="cover-img" src="assets/images/cassette-inspect.svg" alt="Cassette inspection" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Let's begin by<br>inspecting the cassette</h1>
            <div class="inspection">
              <div class="statement incorrect">
                <h3><ion-icon name="close-circle"></ion-icon> Do not proceed if</h3>
                <p>The cassette is damaged or expired</p>
                <p>The drug appears cloudy or yellow</p>
                <p>The drug has floating particulates</p>
              </div>

              <div class="statement correct">
                <h3><ion-icon name="checkmark-circle"></ion-icon> Proceed if</h3>
                <p>The drug is clear</p>
              </div>
            </div>
          </section>
        `,
      },
    },
    {
      header: {
        color: '--color-white',
      },
      content: {
        isExpanded: true,
        hide: false,
        hideNavigation: true,
        toolbar: {
          actions: [
            {
              label: 'Cancel',
              action: () => {
                this.goTo('/home');
              },
            },
            {
              label: `I'm having trouble`,
              action: () => {
                // TODO: having trouble screen
              },
            },
          ],
        },
        template: `
          <section class="cassette-inspection">
            <img src="assets/images/cassette-insert.gif" alt="Cassette insertion" class="cassette-check__image" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Insert the cassette into<br>the Aria Autoinjector</h1>
            <p>Press the cassette until it clicks.</p>
            <p>Aria will play a sound to confirm the cassette is loaded.</p>
            <div class="loader"></div>
          </section>
        `,
      },
    },
    {
      header: {
        color: '--color-white',
      },
      content: {
        isExpanded: true,
        hide: false,
        hideNavigation: true,
        template: `
          <section class="cassette-inspection">
            <img src="assets/images/cassette-check.svg" alt="Checking the cassette" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Checking the cassette</h1>
            <p>Aria will check to make sure the cassette is ready to use.</p>
            <p>You will hear a motor sound.</p>
            <div class="loader"></div>
          </section>
        `,
        toolbar: {},
      },
    },
    {
      header: {
        color: '--color-white',
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
          <section class="cassette-inspection">
            <img src="assets/images/cassette-verified.svg" alt="Cassette verified" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Cassette is verified</h1>
            <!-- <p>Your cassette passed the authenticity and expiration checks.</p> -->
          </section>
        `,
        cards: [
          {
            asset: '/assets/images/dose.svg',
            title: 'Theryx®, 80mg',
            description: 'Synthesized in Dayton, OH on 05/04/2023',
            disclamerText: `Expires ${this.getExpiryDate()}`,
          },
        ],
      },
    },
  ];

  constructor() {
    super();
    addIcons({
      closeCircle,
      checkmarkCircle,
      alertCircle,
      informationCircle,
    });
  }

  ngAfterViewInit() {
    this.#initStateSubscriptions();
  }

  getExpiryDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date.toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'});
  }

  slideNext(sliders: any) {
    sliders.asset.slideNext(500);
    sliders.content.slideNext(500);
  }

  #initStateSubscriptions() {
    combineLatest([
      this.isDeviceConnected$,
      this.isCassetteInsertionRequired$,
      this.isCassetteBeingPrepared$,
      this.isCassetteVerified$,
      this.isCassetteLoadingError$,
      this.isCassetteExpired$,
    ])
      .pipe(
        filter(([isConnected]) => isConnected),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(this.#handleDeviceStateChange.bind(this));
  }

  #handleDeviceStateChange([
    isConnected,
    isInsertionRequired,
    isBeingPrepared,
    isVerified,
  ]: boolean[]): void {
    if (isInsertionRequired) {
      this.#handleCassetteInsertionRequired();
    } else if (isBeingPrepared) {
      this.#handleCassetteBeingPrepared();
    } else if (isVerified) {
      this.#handleCassetteVerified();
    }
  }

  #handleCassetteLoadingError(): void {
    this.deviceState$.pipe(take(1)).subscribe((deviceState) => {
      let title = 'Cassette Loading Error';
      let message = 'The cassette may be defective or was not loaded properly.';

      if (deviceState === DeviceStateCode.WarningCassetteUsed) {
        title = 'Cassette has been used';
        message = 'The cassette has already been used and cannot be re-used.';
      } else if (deviceState === DeviceStateCode.WarningCassetteUnknown) {
        title = 'Cassette is not known';
        message =
          'The cassette cannot be verified and may be from an unknown source.';
      }

      this.store.dispatch(
        new fromSharedStore.AlertShow({
          mode: 'full',
          template: `
      <img src="assets/images/cassette-expired.svg" />
      <h1 class="font-heading-1--bold">${title}</h1>
      <p>${message}</p>
      <p><b>Please check the cassette and reload a different cassette if problem persists.<b></p>
    `,
          actions: [
            {
              label: 'Reload cassette',
              fill: 'outline',
              action: () => {
                this.store.dispatch(new fromSharedStore.AlertHide());
                this.#goToRemoveCassette();
              },
            },
          ],
        })
      );
    });
  }

  #handleCassetteInsertionRequired(): void {
    const currentSlideIndex = this.sliderPage.config.content.currentSlide;

    if (currentSlideIndex <= CassetteJourneySlides.InsertCassette) {
      return;
    }

    console.log('Navigating to InspectCassette slide');
    this.sliderPage.slideTo(CassetteJourneySlides.InspectCassette);
  }

  #handleCassetteBeingPrepared(): void {
    console.log('Navigating to InsertCassette slide');
    this.sliderPage.slideTo(CassetteJourneySlides.CheckCassette);

    const noAlertStates = [
      DeviceStateCode.RemoveNeedleCap,
      DeviceStateCode.ReadyForInjection,
      DeviceStateCode.WarningCassette,
      DeviceStateCode.WarningCassetteUnknown,
      DeviceStateCode.WarningCassetteUsed,
      DeviceStateCode.WarningCassetteExpired,
    ];

    // Start a 10-second timer to check if state hasn't changed
    const timeoutId = setTimeout(() => {
      this.deviceState$
        .pipe(takeUntil(this.ngUnsubscribe), take(1))
        .subscribe((deviceState) => {
          this.#checkDeviceStateAfterTimeout(deviceState, noAlertStates);
        });
    }, 10000);

    // Store the timeout ID to potentially clear it if state changes to a valid state before timeout
    this.deviceState$
      .pipe(
        filter((deviceState) => noAlertStates.includes(deviceState)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((deviceState) => {
        console.log(
          'Device reached a valid state, clearing timeout:',
          deviceState
        );
        clearTimeout(timeoutId);
      });
  }

  #checkDeviceStateAfterTimeout(
    deviceState: number,
    validStates: number[]
  ): void {
    if (validStates.includes(deviceState)) {
      // Device is in a valid state, no action needed
      console.log('Device is in a valid state after 10 seconds:', deviceState);
      return;
    }

    this.#handleCassetteLoadingError();
  }

  #handleCassetteVerified(): void {
    setTimeout(() => {
      console.log('Navigating to CassetteVerified slide');
      this.sliderPage.slideTo(CassetteJourneySlides.CassetteVerified);
    });
  }

  #goToRemoveCassette(): void {
    this.goTo('/home/cassette-remove');
  }

  #mockScenario(): void {
    this.store.dispatch(
      new fromBluetoothStore.StartMockScenario(
        MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_HAPPY_PATH
      )
    );

    // NOTE: Logic to determine which mock scenario to run
    // this.mockScenariosHistory$.pipe(take(1)).subscribe((history) => {
    //   const hasUsedCassetteBeenRun = history.includes(
    //     MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_USED_CASSETTE_PATH
    //   );
    //   const scenarioId = hasUsedCassetteBeenRun
    //     ? MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_HAPPY_PATH
    //     : MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_USED_CASSETTE_PATH;

    //   this.store.dispatch(new fromBluetoothStore.StartMockScenario(scenarioId));
    // });
  }
}
