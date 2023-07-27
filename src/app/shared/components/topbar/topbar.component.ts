import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event as RoutingEvent, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@shared/store';
import * as fromCoreStore from '@core/store';
import * as fromActivityStore from '@activity/store';

@Component({
  selector: 'automagic-topbar',
  templateUrl: 'topbar.component.html',
  styleUrls: ['topbar.component.scss'],
})
export class TopBarComponent implements OnInit, OnDestroy {
  public config$!: Observable<any>;
  public config: any;
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public routerEvents$;
  public activityScope: boolean = false;
  public settingsScope: boolean = false;
  public currentRoute: string = '';
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _router: Router,
  ) {
    this.config$ = this._store.select(fromStore.getTopbarConfig);
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.activityConfig$ = this._store.select(fromActivityStore.getActivityConfig);

    this.routerEvents$ = this._router.events.subscribe(
      (event: RoutingEvent) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
          if (this.currentRoute.includes('home/add-symptom')) {
            if (this.activityConfig.symptomReportSelected) {
              this.activityScope = true;
            }
          }
          else {
            this.activityScope = this.currentRoute.includes('activity/');
            this.settingsScope = this.currentRoute.includes('settings/');
          }
        }
      },
    );
  }

  ngOnInit() {
    this.config$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(config => {
        if (config) {
          this.config = config;
        }
      });
    
    this.layoutConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(layoutConfig => {
        if (layoutConfig) {
          this.layoutConfig = layoutConfig;
        }
      });

    this.activityConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(activityConfig => {
        if (activityConfig) {
          this.activityConfig = activityConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  leftElementAction() {
    if (this.activityScope) {
      if (
        this.currentRoute.includes('activity/calendar') ||
        this.currentRoute.includes('activity/dose-report') ||
        this.currentRoute.includes('activity/your-progress') ||
        this.currentRoute.includes('activity/symptom-report')
      ) {
        this.goTo('activity');
      }

      if (this.currentRoute.includes('activity/dose-report-detail')) {
        this.goTo('activity/dose-report');
      }

      if (this.currentRoute.includes('home/add-symptom')) {
        if (this.activityConfig.symptomReportSelected) {
          this.goTo('activity/symptom-report');
          this._store.dispatch(new fromStore.SliderPageClear());
        }
      }
    }
    else if (this.settingsScope) {
      this.goTo('settings');
    }
    else {
      // this.goTo('profile');
    }
  }

  goTo(path: string) {
    if (path === 'notifications') {
      this._store.dispatch(new fromStore.TopbarChangeColor('--color-white'));
    }

    if (this.currentRoute.includes('home/add-symptom')) {
      if (this.activityConfig.symptomReportSelected) {
        this._store.dispatch(new fromActivityStore.SetData({
          symptomReportSelected: null,
        }));
      }
    }

    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
