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
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public card: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.card = {
      asset: '/assets/images/sleep-guide.svg',
      title: 'Sleep guide',
      description: 'The dip in week 6 may be because you were traveling with lower sleep quality',
      link: {
        label: 'Go to Guide',
        action: () => {
          console.log('Go to Guide Card');
        }
      },
    }
  }

  ngOnInit() {
    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });
  }
}
