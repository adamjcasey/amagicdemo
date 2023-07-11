import { 
  AfterViewInit,
  Component,
  ViewEncapsulation, 
} from '@angular/core';
import { Store } from '@ngrx/store';
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
export class StartDoseReadyToInjectDosingComponent implements AfterViewInit {
  public title: string = 'Starting...';
  public totalTime: number = 10; // 10 seconds

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {}

  ngAfterViewInit() {
    // hold on to start the dose
    setTimeout(() => {
      this.startDose();
    }, 1500);
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
          this._store.dispatch(new fromSharedStore.AlertShow({
            mode: 'window',
            template: `
              <img src="assets/images/dose-delivered.svg" />
              <h1 class="font-heading-1--bold">Full dose delivered!</h1>
              <h3>Theryx®, 80mg</h3>
              <p>Dose Completed:</p>
              <p>${moment().format('D MMM YYYY, H:m a')}</p>
            `,
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
