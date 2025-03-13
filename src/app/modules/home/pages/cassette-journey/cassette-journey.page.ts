import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceStateCode } from '@app/shared/libs/bluetooth';
import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import * as fromCoreStore from '@core/store';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
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
    IonIcon,
  ],
})
export class CassetteJourneyPage implements OnInit, OnDestroy, AfterViewInit {
  #store = inject(Store<fromCoreStore.CoreState>);

  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;

  isCassetteInsertionRequired$: Observable<boolean> = this.#store.select(
    fromBluetoothStore.isCassetteInsertionRequiredState
  );
  isCassetteBeingPrepared$: Observable<boolean> = this.#store.select(
    fromBluetoothStore.isCassetteBeingPreparedState
  );
  isCassetteVerified$: Observable<boolean> = this.#store.select(
    fromBluetoothStore.isCassetteVerifiedState
  );

  isDeviceConnected$: Observable<boolean> = this.#store.select(
    fromBluetoothStore.getIsConnected
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
                this.goTo('/home/start-dose/prepare');
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

  #ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor() {
    addIcons({
      closeCircle,
      checkmarkCircle,
      alertCircle,
      informationCircle,
    });
  }

  ngOnInit() {
    this.#store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-white')
    );
  }

  ngAfterViewInit() {
    this.#initStateSubscriptions();
  }

  #initStateSubscriptions() {
    combineLatest([
      this.isDeviceConnected$,
      this.isCassetteInsertionRequired$,
      this.isCassetteBeingPrepared$,
      this.isCassetteVerified$,
    ])
      .pipe(
        filter(([isConnected]) => isConnected),
        takeUntil(this.#ngUnsubscribe)
      )
      .subscribe(
        ([isConnected, isInsertionRequired, isBeingPrepared, isVerified]) => {
          if (isInsertionRequired) {
            console.log('Navigating to InspectCassette slide');
            this.sliderPage.slideTo(CassetteJourneySlides.InspectCassette);
          } else if (isBeingPrepared) {
            console.log('Navigating to InsertCassette slide');
            this.sliderPage.slideTo(CassetteJourneySlides.CheckCassette);
          } else if (isVerified) {
            setTimeout(() => {
              console.log('Navigating to CassetteVerified slide');
              this.sliderPage.slideTo(CassetteJourneySlides.CassetteVerified);
            });
          }
        }
      );
  }

  ngOnDestroy() {
    this.#ngUnsubscribe.next();
    this.#ngUnsubscribe.complete();
  }

  async slideNext(sliders: any) {
    sliders.asset.slideNext(500);
    sliders.content.slideNext(500);
  }

  goTo(path: string) {
    this.#store.dispatch(new fromCoreStore.Go({ path: [path] }));
  }

  navigateToSlide(slideIndex: CassetteJourneySlides): void {
    this.sliderPage.slideTo(slideIndex);
  }
}
