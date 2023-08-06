import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@activity/store';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';

@Component({
  selector: 'automagic-your-progress',
  templateUrl: 'your-progress.page.html',
  styleUrls: ['your-progress.page.scss'],
})
export class YourProgressPage implements OnInit, OnDestroy {
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;
  public cards: any[];

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.activityConfig$ = this._store.select(fromStore.getActivityConfig);

    this.heroConfig = {
      color: '--color-bg-pastel-honey-yellow',
      template: '<h1 class="font-heading-1--bold">Your progress</h1>',
    }

    this.cards = [
      {
        asset: '/assets/images/your-progress-percentage.svg',
        description: 'Weekly flareups have declined by <strong>57%</strong> over ten weeks!',
      },
      {
        asset: '/assets/images/your-progress-apple-health.svg',
        description: `
          <h5>Apple Health</h5>
          <p>Enabling integration with collects health and fitness data from your iPhone.</p>
        `,
        link: {
          label: 'Let’s start',
          action: () => {
            console.log('Apple Health action');
          }
        },
      },
      {
        description: `
          <img src="/assets/images/activity-page-dose-report-widget.svg">
        `,
        button: {
          label: 'Import data from Apple Health',
          cssClasses: 'hotspot-element',
          icon: '/assets/icons/import.svg',
          fill: 'outline',
          action: () => {
            console.log('Import data from Apple Health action');
          }
        },
      }
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
          if (!this.activityConfig.yourProgressPageVisited && this.homeConfig) {
            const onBoardingTasks = this.homeConfig.onBoardingTasks.map((task: any, index: number) => {
              return {
                ...task,
              }
            });
            onBoardingTasks[2].completed = true;
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
}
