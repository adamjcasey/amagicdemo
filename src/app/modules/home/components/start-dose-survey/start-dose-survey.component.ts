import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '../../store';

@Component({
  selector: 'automagic-start-dose-survey',
  templateUrl: 'start-dose-survey.component.html',
  styleUrls: ['start-dose-survey.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseSurveyComponent implements OnInit {
  public pageData$!: Observable<any>;
  public pageData: any;

  constructor(
    private _store: Store<fromStore.HomeState>,
  ) {
    this.pageData$ = this._store.select(fromStore.getHomeState);
  }

  ngOnInit() {
    this.pageData$.subscribe(pageData => {
      if (pageData) {
        this.pageData = pageData;
      }
    });
  }
}
