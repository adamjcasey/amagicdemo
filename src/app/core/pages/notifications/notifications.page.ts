import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@core/store';
import * as fromHomeStore from '@home/store';
import * as fromResourcesStore from '@resources/store';

@Component({
  selector: 'automagic-notifications',
  templateUrl: 'notifications.page.html',
  styleUrls: ['notifications.page.scss'],
})
export class NotificationsPage implements OnInit, OnDestroy {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public resourcesConfig$!: Observable<any>;
  public resourcesConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public onBoardingTasks!: any[];
  public pendingOnBoardingTask!: any[];

  constructor(
    private _store: Store<fromStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.resourcesConfig$ = this._store.select(fromResourcesStore.getResourcesConfig);
  }

  ngOnInit() {
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          if (
            this.homeConfig.allCompletedDoses && 
            this.homeConfig.onBoardingTasks
          ) {
            this.onBoardingTasks = this.homeConfig.onBoardingTasks.map((task: any, index: number) => {
              return {
                completed: task.completed,
                title: task.title,
                description: task.description,
                asset: `/assets/images/onboarding-task-${index + 1}.svg`,
                onClick: () => {
                  switch(index) {
                    case 0:
                      this.goTo('activity/calendar');
                      break;
                    case 1:
                      this.goTo('activity/dose-report');
                      break;
                    case 2:
                      this.goTo('activity/your-progress');
                      break;
                    case 3:
                      this.goTo('activity/symptom-report');
                      break;
                    case 4:
                      this.goTo('resources');
                      break;
                    case 5:
                      let path = 'resources/your-care-team';
                      const yourCareTeam = this.resourcesConfig.yourCareTeam;
                      if (yourCareTeam.myTeam.length || yourCareTeam.caregivers.length) {
                        path += '/list';
                      }
                      this.goTo(path);
                      break;
                  }
                },
              }
            });
            this.pendingOnBoardingTask = this.onBoardingTasks.filter((task: any) => !task.completed);
          }
        }
      });

    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(resourcesConfig => {
        if (resourcesConfig) {
          this.resourcesConfig = resourcesConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  goTo(path: string) {
    this._store.dispatch(new fromStore.Go({
      path: [path]
    }));
  }
}
