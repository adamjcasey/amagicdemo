import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '../../store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-prepare-survey',
  templateUrl: 'start-dose-prepare-survey.component.html',
  styleUrls: ['start-dose-prepare-survey.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDosePrepareSurveyComponent implements OnInit {
  public pageData$!: Observable<any>;
  public pageData: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.pageData$ = this._store.select(fromStore.getHomeConfig);
  }

  ngOnInit() {
    this.pageData$.subscribe(pageData => {
      if (pageData) {
        this.pageData = pageData;
      }
    });
  }
}
