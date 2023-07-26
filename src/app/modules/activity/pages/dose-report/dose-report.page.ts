import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@activity/store';
import * as fromSharedStore from '@shared/store';
import * as fromHomeStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-dose-report',
  templateUrl: 'dose-report.page.html',
  styleUrls: ['dose-report.page.scss'],
})
export class DoseReportPage implements OnInit, OnDestroy {
  public reports!: any[];
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _utils: fromSharedServices.UtilsService,
  ) {
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
  }

  ngOnInit() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue'));
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          if (this.homeConfig.doses) {
            if (this.homeConfig.doses) {
              this.reports = this.homeConfig?.doses
                .filter((dose: any) => dose.marked)
                .map((dose: any, index: number) => {
                  return {
                    type: 'dose-report',
                    title: `Dose ${index + 1} <span>${moment(dose.date).format('MMM D, H:mm A')}</span>`,
                    template: `
                      <div class="dose-report-widget">
                        <img src="/assets/images/activity-page-dose-report-widget.svg">
                      </div>
                    `,
                    onClick: () => {
                      this._store.dispatch(new fromStore.SetData({
                        doseReportSelected: {
                          ...dose,
                          numberDose: index + 1,
                        }
                      }));
                      this.goTo(`activity/dose-report-detail`);
                    },
                    asset: `assets/images/activity-highlights-dose-report-${dose.bodyPart.toLowerCase().replace(' ', '-')}.svg`,
                    description: `This time you injected your <strong>${this._utils.humanizeBodyPartInjected(dose.bodyPart)}<strong>`
                  }
                });
            }
          }
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }

}
