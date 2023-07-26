import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-calendar-edit-schedule',
  templateUrl: 'calendar-edit-schedule.component.html',
  styleUrls: ['calendar-edit-schedule.component.scss'],
})
export class CalendarEditScheduleComponent {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
  }

  ngOnInit() {
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });
  }
}
