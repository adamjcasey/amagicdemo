import { 
  Component,
  OnInit,
  ViewEncapsulation, 
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-inject-done-report',
  templateUrl: 'start-dose-inject-done-report.component.html',
  styleUrls: ['start-dose-inject-done-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseInjectDoneReportComponent implements OnInit {
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
}
