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

@Component({
  selector: 'automagic-start-dose-ready-to-inject-dosing',
  templateUrl: 'start-dose-ready-to-inject-dosing.component.html',
  styleUrls: ['start-dose-ready-to-inject-dosing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectDosingComponent implements OnInit, AfterViewInit {
  public title: string = 'Starting...';
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public totalTime: number = 10; // 10 seconds
  public nextDose: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
  }

  ngOnInit() {
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
  }

  ngAfterViewInit() {
    // hold on to start the dose
    setTimeout(() => {
      this.startDose();
    }, 500);
  }

  startDose() {
    this.title = 'Dosing...';
    const loop = setInterval(() => {
      this.totalTime--;
      if (this.totalTime === 0) {
        this.title = 'Full dose delivered!';
        this._store.dispatch(new fromSharedStore.SliderPageSetHeaderOptions({
          color: '--color-bg-pastel-lime',
        }));

        // hold on 1s to show the alert
        setTimeout(() => {
          let template;
          if (this.nextDose) {
            const dateNextDose = moment(this.nextDose.date);
            dateNextDose.set('hour', moment().get('hour'));
            dateNextDose.set('minute', moment().get('minute'));
            template = `
              <img src="assets/images/dose-delivered.svg" />
              <h1 class="font-heading-1--bold">Full dose delivered!</h1>
              <h3>Theryx®, 80mg</h3>
              <p>Dose Completed:</p>
              <p>${dateNextDose.format('D MMM YYYY, H:m a')}</p>
            `;
          }
          else {
            template = `
              <img src="assets/images/dose-delivered.svg" />
              <h1 class="font-heading-1--bold">Full dose delivered!</h1>
              <h3>Theryx®, 80mg</h3>
              <p>Dose Completed:</p>
              <p>This is your 6 Dose</p>
            `;
          }
            
          this._store.dispatch(new fromSharedStore.AlertShow({
            mode: 'window',
            template: template,
            actions: [
              {
                label: 'Ok, let’s go!',
                fill: 'outline',
                action: () => {
                  this._store.dispatch(new fromSharedStore.AlertClose());
                  this._store.dispatch(new fromSharedStore.SliderPageClear());
                  this._store.dispatch(new fromCoreStore.Go({
                    path: ['/home/start-dose/inject-done']
                  }));
                },
              }
            ],
          }));
        }, 1000);
        clearInterval(loop);
      }
    }, 1000);
  }
}
