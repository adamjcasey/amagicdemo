import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@activity/store';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-symptom-report',
  templateUrl: 'symptom-report.page.html',
  styleUrls: ['symptom-report.page.scss'],
})
export class SymptomReportPage implements OnInit, OnDestroy {
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public symptomReports: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _utils: fromSharedServices.UtilsService,
  ) {
    this.activityConfig$ = this._store.select(fromStore.getActivityConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
  }

  ngOnInit() {
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });

    this.activityConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(activityConfig => {
        if (activityConfig) {
          this.activityConfig = activityConfig;

          if (this.activityConfig.symptomReports) {
            this.symptomReports = this.activityConfig.symptomReports.map((report: any) => {
              return {
                title: moment(report.date).format('MMM D, H:mm A'),
                template: `
                  <div class="symptom-report-widget">
                    <div class="row-field symptoms">
                      <h5>Symptoms</h5>
                      <p>${report.symptoms.join(', ')}</p>
                    </div>
      
                    <div class="row-field severity">
                      <h5>Severity</h5>
                      <p class="level-${report.severity}">${this.humanizeSeveritySymptom(report.severity)}</p>
                    </div>
                  </div>
                `,
                onClick: () => {
                  this._store.dispatch(new fromStore.SetData({
                    symptomReportSelected: report,
                  }));
                  this.goTo('home/add-symptom');
                }
              }
            });
          }

          if (!this.activityConfig.symptomReportPageVisited && this.homeConfig) {
            const onBoardingTasks = this.homeConfig.onBoardingTasks.map((task: any) => {
              return {
                ...task,
              }
            });
            onBoardingTasks[3].completed = true;
            this._store.dispatch(new fromHomeStore.SetData({
              onBoardingTasks: onBoardingTasks,
            }));
          }
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  humanizeSeveritySymptom(value: number) {
    return this._utils.humanizeSeveritySymptom(value);
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
