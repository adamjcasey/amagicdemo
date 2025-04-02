import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BluetoothService } from '@app/shared/libs/bluetooth';
import * as fromBluetoothStore from '@app/shared/libs/bluetooth/store';
import {
  isLiftFromInjectionSiteState,
  isReleasingCassetteState,
} from '@app/shared/libs/bluetooth/store/device-state.selectors';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
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
  implements OnInit, AfterViewInit, OnDestroy
{
  public title: string = 'Starting...';
  public doseStatus: string = 'Hold...';
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public nextDose: any;
  public startDosing: boolean = false;
  public errorDosing: boolean = false;
  public dosePercentageCompleted: number = 0;
  public doseDone: boolean = false;

  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _bluetoothService: BluetoothService,
    private _cdr: ChangeDetectorRef
  ) {
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
  }

  ngOnInit() {
    this.dosePercentageCompleted = 0;
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple')
    );
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          if (this.homeConfig.firstTimeDose) {
            this.nextDose = this.homeConfig.doses[1];
          } else {
            const markedDoses = this.homeConfig?.doses.filter(
              (dose: any) => dose.marked
            );
            this.nextDose = this.homeConfig.doses[markedDoses];
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

  ngAfterViewInit() {
    this.startDose();
    this.checkDosingProcess();
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  startDose() {
    this.title = 'Dosing...';
    this.startDosing = true;
  }

  checkDosingProcess() {
    this._store
      .select(fromBluetoothStore.getDeviceStateData)
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((stateData) => {
        if (stateData !== null) {
          // Convert hex to percentage (00 to FF = 0 to 255)
          const progress = (stateData / 255) * 100;

          if (progress > this.dosePercentageCompleted) {
            this.dosePercentageCompleted = progress;
          }

          if (progress >= 95) {
            this.title = 'Hold...';
            this.doseStatus = 'The injection is almost done...';
            this._store.dispatch(
              new fromSharedStore.SliderPageSetHeaderOptions({
                color: '--color-bg-pastel-blue',
              })
            );
          } else {
            this.title = 'Dosing...';
            this.doseStatus = 'The injection is in progress...';
          }

          this._cdr.detectChanges();
        }
      });

    this._store
      .select(isLiftFromInjectionSiteState)
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((isLiftFromSite) => {
        if (isLiftFromSite) {
          this.doseDone = true;
          this.title = 'Full dose delivered!';
          this.doseStatus = 'Done!';
          this._cdr.detectChanges();
          this._store.dispatch(
            new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint')
          );
          this._store.dispatch(
            new fromSharedStore.SliderPageSetHeaderOptions({
              color: '--color-bg-pastel-mint',
            })
          );

          this._store
            .select(isReleasingCassetteState)
            .pipe(
              takeUntil(this._ngUnsubscribe),
              filter((isReleasingCassette) => isReleasingCassette),
              take(1)
            )
            .subscribe(() => {
              this.handleReleasingCassetteScreen();
            });

          const markedDoses = this.homeConfig.doses.filter(
            (dose: any) => dose.marked
          );
          const unMarkedDoses = this.homeConfig.doses.filter(
            (dose: any) => !dose.marked
          );
          const currentDoseDate =
            unMarkedDoses.length > 0
              ? moment(unMarkedDoses[0].date)
              : moment(markedDoses[markedDoses.length - 1].date).add(
                  2,
                  'weeks'
                );

          currentDoseDate.set('hour', moment().get('hour'));
          currentDoseDate.set('minute', moment().get('minute'));
          const doseDateFormatted =
            currentDoseDate.format('D MMMM YYYY H:mm A');

          this._store.dispatch(
            new fromBluetoothStore.IncrementSuccessfulDoses()
          );

          this._store.dispatch(
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
                    this._store.dispatch(new fromSharedStore.AlertHide());
                    this._store.dispatch(new fromSharedStore.SliderPageClear());
                    this._store.dispatch(
                      new fromStore.SetData({
                        dosingStarted: false,
                      })
                    );
                    this._store.dispatch(
                      new fromSharedStore.SliderPageSlideNext()
                    );
                  },
                },
              ],
            })
          );
        }
      });

    /* Commenting out error handling for now
    this._store
      .select(isInjectingState)
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((isInjecting) => {
        if (!isInjecting && this.startDosing && !this.doseDone) {
          this.errorDosing = true;
          this._store.dispatch(
            new fromStore.SetData({
              dosingError: true,
            })
          );
          this._store.dispatch(
            new fromCoreStore.SetDosageDeviceInfo({
              isConnected: false,
            })
          );
          this._store.dispatch(
            new fromSharedStore.TopbarChangeColor('--color-bg-pastel-salmon')
          );
          this._store.dispatch(
            new fromSharedStore.SliderPageSetHeaderOptions({
              color: '--color-bg-pastel-salmon',
            })
          );
          this._store.dispatch(
            new fromSharedStore.AlertShow({
              mode: 'window',
              template: `
              <div class="dosing-error-alert">
                <img src="assets/images/dose-dosing-error.svg" />
                <h1 class="font-heading-1--bold">Oops!</h1>
                <p>You lifted off early and the dose was only ${
                  this.dosePercentageCompleted === 100
                    ? 90
                    : this.dosePercentageCompleted
                }% administered.</p>
                <h5>Please contact your HCP for guidance.</h5><br>
              </div>
            `,
              actions: [
                {
                  label: 'Ok',
                  action: () => {
                    if (this.layoutConfig.noDeviceModeOopsFlow) {
                      this._store.dispatch(
                        new fromCoreStore.SetNoDeviceModeOopsFlow(false)
                      );
                    }
                    this._store.dispatch(new fromSharedStore.AlertHide());
                    this.continueDosing();
                  },
                },
                {
                  label: 'My HCP',
                  action: () => {
                    if (this.layoutConfig.noDeviceModeOopsFlow) {
                      this._store.dispatch(
                        new fromCoreStore.SetNoDeviceModeOopsFlow(false)
                      );
                    }
                    this._store.dispatch(new fromSharedStore.AlertHide());
                    this.continueDosing();
                  },
                },
              ],
            })
          );
        }
      });
    */
  }

  handleReleasingCassetteScreen() {
    this._store.dispatch(new fromSharedStore.AlertHide());
    this._store.dispatch(new fromSharedStore.SliderPageClear());
    this._store.dispatch(
      new fromStore.SetData({
        dosingStarted: false,
      })
    );
    this._store.dispatch(new fromSharedStore.SliderPageSlideNext());
  }

  async continueDosing() {
    this._store.dispatch(
      new fromSharedStore.BackdropShow({
        transition: 'move',
        header: true,
        blockClose: true,
        showBackButton: false,
        component: 'dosing-try-again',
        onClose: async () => {
          this.errorDosing = false;
          // this._store.dispatch(new fromStore.SetData({
          //   dosingError: false,
          // }));
          // to continue with the dose flow
          // try {
          //   const startDosing = await this._bluetoothService.waitForDosingStart(true);
          //   if (startDosing) {
          //     this.totalTime += 1;
          //     this.startDose();
          //     this.checkDosingProcess(true);
          //   }
          // }
          // catch (error) {
          //   console.log('restartDosing > error: ', error);
          // }
        },
      })
    );
  }
}
