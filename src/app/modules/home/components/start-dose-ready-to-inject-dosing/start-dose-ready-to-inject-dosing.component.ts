import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { filter, Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import {
  isLiftFromInjectionSiteState,
  isReleasingCassetteState,
  isWarningInjectionIncompleteState,
} from '@app/shared/libs/bluetooth/store/device-state.selectors';
import * as fromCoreStore from '@core/store';
import { IonImg } from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-dosing',
  templateUrl: 'start-dose-ready-to-inject-dosing.component.html',
  styleUrls: ['start-dose-ready-to-inject-dosing.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonImg],
})
export class StartDoseReadyToInjectDosingComponent
  implements OnInit, AfterViewInit
{
  #store: Store<fromCoreStore.CoreState> = inject(Store);
  #cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  #destroyRef: DestroyRef = inject(DestroyRef);

  title: string = 'Starting...';
  doseStatus: string = 'Hold...';

  startDosing: boolean = false;
  errorDosing: boolean = false;
  dosePercentageCompleted: number = 0;
  doseDone: boolean = false;

  injectionCompleted$: Observable<boolean> = this.#store
    .select(isLiftFromInjectionSiteState)
    .pipe(takeUntilDestroyed(this.#destroyRef), filter(Boolean));

  injectionIncomplete$: Observable<boolean> = this.#store
    .select(isWarningInjectionIncompleteState)
    .pipe(takeUntilDestroyed(this.#destroyRef), filter(Boolean));

  releasingCassette$: Observable<boolean> = this.#store
    .select(isReleasingCassetteState)
    .pipe(takeUntilDestroyed(this.#destroyRef), filter(Boolean));

  ngOnInit() {
    this.dosePercentageCompleted = 0;
    this.#store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple')
    );
  }

  ngAfterViewInit() {
    this.startDose();
    this.checkDosingProcess();
  }

  startDose() {
    this.title = 'Dosing...';
    this.startDosing = true;
  }

  checkDosingProcess() {
    this.#store
      .select(fromBluetoothStore.getDeviceStateData)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((stateData) => {
        if (stateData !== null) {
          // Convert hex to percentage (00 to FF = 0 to 255)
          const progress = (stateData / 255) * 100;

          if (progress > this.dosePercentageCompleted) {
            this.dosePercentageCompleted = progress;
          }

          if (progress >= 80) {
            this.title = 'Hold...';
            this.doseStatus = 'The injection is almost done...';
            this.#store.dispatch(
              new fromSharedStore.SliderPageSetHeaderOptions({
                color: '--color-bg-pastel-blue',
              })
            );
          } else {
            this.title = 'Dosing...';
            this.doseStatus = 'The injection is in progress...';
          }

          this.#cdr.detectChanges();
        }
      });

    // Handle successful complete injection
    this.injectionCompleted$.subscribe(() => {
      this.doseDone = true;
      this.title = 'Full dose delivered!';
      this.doseStatus = 'Done!';
      this.#cdr.detectChanges();
      this.#store.dispatch(
        new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint')
      );
      this.#store.dispatch(
        new fromSharedStore.SliderPageSetHeaderOptions({
          color: '--color-bg-pastel-mint',
        })
      );

      this.releasingCassette$.subscribe(() => {
        this.#handleReleasingCassetteScreen();
      });

      this.#showDosingSuccessAlert();

      this.#store.dispatch(new fromBluetoothStore.IncrementSuccessfulDoses());
    });

    // Handle incomplete injection
    this.injectionIncomplete$.subscribe(() => {
      if (this.startDosing && !this.doseDone) {
        this.errorDosing = true;

        this.#store.dispatch(
          new fromSharedStore.TopbarChangeColor('--color-bg-pastel-salmon')
        );
        this.#store.dispatch(
          new fromSharedStore.SliderPageSetHeaderOptions({
            color: '--color-bg-pastel-salmon',
          })
        );

        this.releasingCassette$.subscribe(() => {
          this.#handleReleasingCassetteScreen(false);
        });

        this.#showDosingErrorAlert();
      }
    });
  }

  #handleReleasingCassetteScreen(hideAlert: boolean = true) {
    if (hideAlert) {
      this.#store.dispatch(new fromSharedStore.AlertHide());
    }
    this.#store.dispatch(new fromSharedStore.SliderPageClear());
    this.#store.dispatch(new fromSharedStore.SliderPageSlideNext());
  }

  #showContinueDosingBackdrop() {
    this.#store.dispatch(
      new fromSharedStore.BackdropShow({
        transition: 'move',
        header: true,
        showBackButton: false,
        template: `
        <div class="no-needless-message">
          <h1 class="font-heading-1--bold">For this demo let's try that again</h1>
          <img src="assets/images/injection-try-again.svg">
          <p>For the correct injection experience:</p>
          <p>1. Follow the app prompts to begin the injection.</p>
          <p>2. <b>Hold the injector down until the app shows a completed injection (10 seconds).</b></p>
        </div>
      `,
      })
    );
  }

  #showDosingSuccessAlert() {
    const doseDateFormatted = moment().format('D MMMM YYYY H:mm A');

    this.#store.dispatch(
      new fromSharedStore.AlertShow({
        mode: 'window',
        template: `
          <h1 class="font-heading-1--bold">Full dose delivered!</h1>
          <p><b>The injection is complete.<br />It's ok to lift the autoinjector.</b></p>
          <img src="assets/images/dose-delivered.svg" style="margin: 0 auto; width: 240px;" />
          <h3>Theryx®, 80mg</h3>
          <p>Dose Completed:</p>
          <p>${doseDateFormatted}</p>
        `,
        actions: [
          {
            label: 'Done',
            fill: 'outline',
            action: () => {
              this.#handleReleasingCassetteScreen();
            },
          },
        ],
      })
    );
  }

  #showDosingErrorAlert() {
    this.#store.dispatch(
      new fromSharedStore.AlertShow({
        mode: 'window',
        template: `
        <div class="dosing-error-alert">
          <img src="assets/images/dose-dosing-error.svg" />
          <h1 class="font-heading-1--bold">Oops!</h1>
          <p>You lifted off early and the dose was only ${Math.round(
            this.dosePercentageCompleted
          )}% administered.</p>
          <p><b>Please contact your HCP for guidance.</b></p>
        </div>
      `,
        actions: [
          {
            label: 'Ok',
            action: () => {
              this.#store.dispatch(new fromSharedStore.AlertHide());
              this.#showContinueDosingBackdrop();
            },
          },
          {
            label: 'My HCP',
            action: () => {
              // This action won't be triggered
            },
          },
        ],
      })
    );
  }
}
