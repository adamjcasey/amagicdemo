import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, filter, Observable, take, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceStateCode } from '@app/shared/libs/bluetooth';
import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import * as fromCoreStore from '@core/store';
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
  implements OnInit, AfterViewInit
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

  deviceState$: Observable<number> = this.store.select(
    fromBluetoothStore.getDeviceState
  );

  slides: Array<any> = [
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
              label: 'Looks good',
              action: () => {
                this.sliderPage.slideNext();
              },
            },
          ],
        },
        template: `
          <section class="cassette-inspection">
            <img src="assets/images/cassette-inspect.svg" alt="Cassette inspection" />
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
                this.#goTo('/home');
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
            <img src="assets/images/cassette-insert.svg" alt="Cassette insertion" class="cassette-check__image" />
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
                this.#goTo('/home/start-dose/prepare');
              },
            },
          ],
        },
        template: `
          <section class="cassette-inspection">
            <img src="assets/images/cassette-verified.svg" alt="Cassette verified" />
            <h1 class="font-heading-1--bold ion-text-nowrap">Cassette is verified</h1>
            <p>Your cassette passed the authenticity and expiration checks.</p>
          </section>
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

  CassetteJourneySlides = CassetteJourneySlides;
  DeviceStateCode = DeviceStateCode;

  constructor() {
    super();
    addIcons({
      closeCircle,
      checkmarkCircle,
      alertCircle,
      informationCircle,
    });
  }

  ngOnInit() {
    this.store.dispatch(new fromSharedStore.TopbarChangeColor('--color-white'));
    this.initDeviceConnectionMonitoring();
  }

  ngAfterViewInit() {
    this.#initStateSubscriptions();
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
    isLoadingError,
    isExpired,
  ]: boolean[]): void {
    if (isLoadingError) {
      this.#handleCassetteLoadingError();
    } else if (isExpired) {
      this.#handleCassetteExpired();
    } else if (isInsertionRequired) {
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
                this.#handleCassetteInsertionRequired();
              },
            },
          ],
        })
      );
    });
  }

  #handleCassetteExpired(): void {
    this.#showDrugExpiredAlert();
  }

  #handleCassetteInsertionRequired(): void {
    console.log('Navigating to InspectCassette slide');
    this.sliderPage.slideTo(CassetteJourneySlides.InspectCassette);
  }

  #handleCassetteBeingPrepared(): void {
    console.log('Navigating to InsertCassette slide');
    this.sliderPage.slideTo(CassetteJourneySlides.CheckCassette);

    const validStates = [
      DeviceStateCode.RemoveNeedleCap,
      DeviceStateCode.ReadyForInjection,
    ];

    // Start a 10-second timer to check if state hasn't changed
    const timeoutId = setTimeout(() => {
      this.deviceState$
        .pipe(takeUntil(this.ngUnsubscribe), take(1))
        .subscribe((deviceState) => {
          this.#checkDeviceStateAfterTimeout(deviceState, validStates);
        });
    }, 10000);

    // Store the timeout ID to potentially clear it if state changes to a valid state before timeout
    this.deviceState$
      .pipe(
        filter((deviceState) => validStates.includes(deviceState)),
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

  #showDrugExpiredAlert() {
    this.store.dispatch(
      new fromSharedStore.AlertShow({
        mode: 'full',
        template: `
      <img src="assets/images/cassette-expired.svg" />
      <h1 class="font-heading-1--bold">Drug expired</h1>
      <p>The dose has expired and is not safe to use.</p>
      <p><b>Please remove the cassette and replace with unexpired cassette and contact your Pharmacy for a new dose.</b></p>
    `,
        actions: [
          {
            label: 'Ok',
            fill: 'outline',
            action: () => {
              this.store.dispatch(new fromSharedStore.AlertHide());
              this.#handleCassetteInsertionRequired();
            },
          },
          {
            label: 'My Pharmacy',
            fill: 'outline',
            action: () => {
              this.store.dispatch(new fromSharedStore.AlertHide());
              this.#handleCassetteInsertionRequired();
            },
          },
        ],
      })
    );
  }

  #goTo(path: string) {
    this.store.dispatch(new fromCoreStore.Go({ path: [path] }));
  }
}
