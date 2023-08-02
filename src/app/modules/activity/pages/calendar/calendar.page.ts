import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@activity/store';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-calendar',
  templateUrl: 'calendar.page.html',
  styleUrls: ['calendar.page.scss'],
})
export class CalendarPage implements OnInit, OnDestroy {
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public slides: any[];

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.activityConfig$ = this._store.select(fromStore.getActivityConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.slides = [
      {
        header: {
          color: '--color-bg-pastel-purple',
          component: 'calendar-doses',
        },
        content: {
          hide: true,
        },
      },
    ];
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
          if (!this.activityConfig.calendarPageVisited && this.homeConfig) {
            const onBoardingTasks = this.homeConfig.onBoardingTasks.map((task: any, index: number) => {
              return {
                ...task,
              }
            });
            onBoardingTasks[0].completed = true;
            this._store.dispatch(new fromHomeStore.SetData({
              onBoardingTasks: onBoardingTasks,
            }));
            const remainingTasks = this.homeConfig.onBoardingTasks.length - this.homeConfig.onBoardingTasks.filter((task: any) => task.completed).length;
            this._store.dispatch(new fromSharedStore.TopbarPendingNotifications(remainingTasks));
          }
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }
}
