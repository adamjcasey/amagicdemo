import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@activity/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedServices from '@shared/services'

@Component({
  selector: 'automagic-dose-report-detail',
  templateUrl: 'dose-report-detail.page.html',
  styleUrls: ['dose-report-detail.page.scss'],
})
export class DoseReportDetailPage implements OnInit, OnDestroy {
  public activityConfig$!: Observable<any>;
  public doseReportSelected: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _utils: fromSharedServices.UtilsService,
  ) {
    this.activityConfig$ = this._store.select(fromStore.getActivityConfig);
  }

  ngOnInit() {
    this.activityConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(activityConfig => {
        if (activityConfig) {
          this.doseReportSelected = activityConfig.doseReportSelected;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  preprocessInjectionImage() {
    return this.doseReportSelected.bodyPartInjected.toLowerCase().replace(' ', '-');
  }

  preprocessDescriptionImage() {
    return this._utils.humanizeBodyPartInjected(this.doseReportSelected.bodyPartInjected);
  }
}
