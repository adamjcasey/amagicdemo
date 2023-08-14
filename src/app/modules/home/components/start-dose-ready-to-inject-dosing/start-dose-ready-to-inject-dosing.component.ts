import { 
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation, 
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-dosing',
  templateUrl: 'start-dose-ready-to-inject-dosing.component.html',
  styleUrls: ['start-dose-ready-to-inject-dosing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectDosingComponent implements OnInit, AfterViewInit {
  public title: string = 'Starting...';
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public totalTime: number = 10; // 10 seconds
  public nextDose: any;
  public startDosing: boolean = false;
  public errorDosing: boolean = false;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _bluetoothService: fromSharedServices.BluetoothService,
  ) {
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
  }

  ngOnInit() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple'));
    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
        if (this.homeConfig.firstTimeDose) {
          this.nextDose = this.homeConfig.doses[1];
        }
        else {
          const markedDoses = this.homeConfig?.doses.filter((dose: any) => dose.marked);
          this.nextDose = this.homeConfig.doses[markedDoses];
        }
      }
    });

    this.layoutConfig$.subscribe(layoutConfig => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
      }
    });
  }

  ngAfterViewInit() {
    this.startDose();
    this.checkDosingProcess();
  }

  startDose() {
    this.title = 'Dosing...';
    this.startDosing = true;
    const loop = setInterval(() => {
      this.totalTime--;
      if (this.totalTime === 0 || this.errorDosing) {
        clearInterval(loop);
      }
    }, 1000);
  }

  async checkDosingProcess(continueDose?: boolean) {
    try {
      const dosingProcess = await this._bluetoothService.checkDosing(continueDose ? this.totalTime * 1000 : undefined);
      if (dosingProcess) {
        this.title = 'Full dose delivered!';
        this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-lime'));
        this._store.dispatch(new fromSharedStore.SliderPageSetHeaderOptions({
          color: '--color-bg-pastel-lime',
        }));

        let nextDoseDateFormatted;
        const markedDoses = this.homeConfig.doses.filter((dose: any) => dose.marked);
        const unMarkedDoses = this.homeConfig.doses.filter((dose: any) => !dose.marked);
        if (markedDoses.length === 0) {
          const dateNextDose = moment(unMarkedDoses[1].date);
          dateNextDose.set('hour', moment().get('hour'));
          dateNextDose.set('minute', moment().get('minute'));
          nextDoseDateFormatted = dateNextDose.format('D MMMM YYYY H:mm A');
        }

        if (markedDoses.length === 5) {
          const lastDose = unMarkedDoses[0];
          const lastDoseDate = moment(lastDose.date);
          lastDoseDate.set('hour', moment().get('hour'));
          lastDoseDate.set('minute', moment().get('minute'));
          lastDoseDate.add(2, 'weeks');
          nextDoseDateFormatted = lastDoseDate.format('D MMMM YYYY H:mm A');
        }

        this._store.dispatch(new fromSharedStore.AlertShow({
          mode: 'window',
          template: `
            <img src="assets/images/dose-delivered.svg" />
            <h1 class="font-heading-1--bold">Full dose delivered!</h1>
            <h3>Theryx®, 80mg</h3>
            <p>Dose Completed:</p>
            <p>${nextDoseDateFormatted}</p>
          `,
          actions: [
            {
              label: 'Ok, let’s go!',
              fill: 'outline',
              action: () => {
                this._store.dispatch(new fromSharedStore.AlertHide);
                this._store.dispatch(new fromSharedStore.SliderPageClear());
                this._store.dispatch(new fromCoreStore.Go({
                  path: ['/home/start-dose/inject-done']
                }));
              },
            }
          ],
        }));
      }
    }
    catch (error) {
      this.errorDosing = true;
      this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-salmon'));
      this._store.dispatch(new fromSharedStore.SliderPageSetHeaderOptions({
        color: '--color-bg-pastel-salmon',
      }));
      this._store.dispatch(new fromSharedStore.AlertShow({
        mode: 'window',
        template: `
          <div class="dosing-error-alert">
            <img src="assets/images/dose-dosing-error.svg" />
            <h1 class="font-heading-1--bold">Oops!</h1>
            <p>You lifted off early and the dose was only 65% of dose administered.</p>
            <h5>Please contact your HCP for guidance.</h5><br>
          </div>
        `,
        actions: [
          {
            label: 'Ok',
            action: () => {
              if (this.layoutConfig.noDeviceModeOopsFlow) {
                this._store.dispatch(new fromCoreStore.SetNoDeviceModeOopsFlow(false));
              }
              this._store.dispatch(new fromSharedStore.AlertHide);
              this.continueDosing();
            },
          },
          {
            label: 'My HCP',
            action: () => {
              if (this.layoutConfig.noDeviceModeOopsFlow) {
                this._store.dispatch(new fromCoreStore.SetNoDeviceModeOopsFlow(false));
              }
              this._store.dispatch(new fromSharedStore.AlertHide);
              this.continueDosing();
            },
          }
        ],
      }));
    }
  }

  async continueDosing() {    
    this._store.dispatch(new fromSharedStore.BackdropShow({
      transition: 'move',
      header: true,
      template: `
        <div class="dosing-demo-try-again-message">
          <h1 class="font-heading-1--bold">For this demo let’s try that again</h1>
          <img src="assets/images/dosing-try-again.svg">
          <p>Now you’ve seen what happens if you lift the injector too early.</p>
          <p>For the correct injection experience, follow the app prompts and <br><strong>hold the injector down until the <br>app shows a completed injection <br>(10 seconds).</strong></p>
        </div>
      `,
      onClose: async () => {
        this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple'));
        this._store.dispatch(new fromSharedStore.SliderPageSetHeaderOptions({
          color: '--color-bg-pastel-purple',
        }));
        this.errorDosing = false;
        this._store.dispatch(new fromSharedStore.SliderPageSlidePrev);
        
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
      }
    }));
  }
}
