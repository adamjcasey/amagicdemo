import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@activity/store';
import * as fromHomeStore from '@home/store';
import * as fromSharedStore from '@shared/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-activity',
  templateUrl: 'activity.page.html',
  styleUrls: ['activity.page.scss'],
})
export class ActivityPage implements OnInit, OnDestroy {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public widgets: any[] = [];
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _utils: fromSharedServices.UtilsService
  ) {
    this.activityConfig$ = this._store.select(fromStore.getActivityConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.widgets = [
      {
        tabColor: '--color-bg-pastel-purple',
        title: 'Calendar',
        template: `
          <div class="calendar-widget">
            <p class="indicators">
              <span class="today">Today</span>
              <span class="next-dose">Next Dose</span>
              <span class="reminder">Reminder</span>
              <span class="flare-ups">Flare-ups</span>
            </p>
          </div>
        `,
        onClick: () => {
          this.goTo('activity/calendar');
        }
      },
      {
        type: 'dose-report',
        tabColor: '--color-bg-pastel-blue',
        title: 'Dose Report',
        template: `
          <div class="dose-report-widget">
            <img src="/assets/images/activity-page-dose-report-widget.svg">
          </div>
        `,
        onClick: () => {
          this.goTo('activity/dose-report');
        }
      },
      {
        tabColor: '--color-bg-pastel-honey-yellow',
        title: 'Your Progress',
        asset: '/assets/images/activity-highlights-your-progress.svg',
        onClick: () => {
          this.goTo('activity/your-progress');
        }
      },
      {
        tabColor: '--color-bg-pastel-tiffany-blue',
        title: 'Symptom Report',
        onClick: () => {
          this.goTo('activity/symptom-report');
        }
      }
    ];
  }

  ngOnInit() {
    this._store.dispatch(new fromSharedStore.SliderPageClear());
    this.activityConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(activityConfig => {
        if (activityConfig) {
          if (activityConfig.symptomReports) {
            const lastReport = activityConfig.symptomReports[activityConfig.symptomReports.length - 1];
            this.widgets[3].template = `
              <div class="symptom-report-widget">
                <h4>
                  ${moment(lastReport.date).format('MMM D')}, 
                  <span>${moment(lastReport.date).format('H:mm A')}</span>
                </h4>
                <div class="row-field symptoms">
                  <h5>Symptoms</h5>
                  <p>${lastReport.symptoms.join(', ')}</p>
                </div>
  
                <div class="row-field severity">
                  <h5>Severity</h5>
                  <p class="level-${lastReport.severity}">${this.humanizeSeveritySymptom(lastReport.severity)}</p>
                </div>
              </div>
            `;
          }
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          if (this.homeConfig.doses) {
            const doseDates = this.homeConfig.doses.map((dose: any) => dose.date );
            this.widgets[0].component = {
              type: 'datepicker',
              multiple: true,
              selectedDates: doseDates,
              continuous: true,
              monthsPerView: 1,
              disabled: true,
            };

            // getting last marked dose for Dose report widget
            if (!this.homeConfig.firstTimeDose) { 
              const markedDoses = this.homeConfig?.doses.filter((dose: any) => dose.marked);
              const lastMarkedDose = markedDoses[markedDoses.length - 1];
              this.widgets[1].numberDose = markedDoses.length;
              this.widgets[1].time = moment(lastMarkedDose.date).format('MMM D, H:m A');
              this.widgets[1].asset = `assets/images/activity-highlights-dose-report-${lastMarkedDose.bodyPart.toLowerCase().replace(' ', '-')}.svg`;
              this.widgets[1].description = `This time you injected your <strong>${this._utils.humanizeBodyPartInjected(lastMarkedDose.bodyPart)}<strong>`
            }
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
