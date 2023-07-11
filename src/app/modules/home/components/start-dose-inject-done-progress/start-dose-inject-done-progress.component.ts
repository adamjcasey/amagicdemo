import { 
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation, 
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-inject-done-progress',
  templateUrl: 'start-dose-inject-done-progress.component.html',
  styleUrls: ['start-dose-inject-done-progress.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseInjectDoneProgressComponent implements OnInit, AfterViewInit {
  public title: string = 'Verifying...';
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public doseMarked: boolean = false;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
  }

  ngOnInit() {
    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });
  }

  ngAfterViewInit() {
    // hold on 1s before complete the dose
    setTimeout(() => {
      this.markDoseAsDone();
    }, 1000);
  }

  markDoseAsDone() {
    const doses = cloneDeep(this.homeConfig?.doses);
    // if this is the first dose
    if (this.homeConfig.firstTimeDose) {
      this.title = 'First dose done!';
      doses[0].marked = true;
      doses[0].date = new Date();
    }
    else {
      const markedDoses = this.homeConfig?.doses.filter((dose: any) => dose.marked);
      doses[markedDoses.length].marked = true;
      doses[markedDoses.length].date = new Date();
      this.title = `${markedDoses.length} doses done`;
    }

    this.doseMarked = true;
    this._store.dispatch(new fromStore.SetData({
      doses: doses
    }));
  }
}
