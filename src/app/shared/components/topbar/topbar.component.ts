import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event as RoutingEvent, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@shared/store';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import * as fromActivityStore from '@activity/store';
import * as fromResourcesStore from '@resources/store';
import * as fromSharedStore from '@shared/store';

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
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public routerEvents$;
  public activityScope: boolean = false;
  public settingsScope: boolean = false;
  public resourcesScope: boolean = false;
  public currentRoute: string = '';
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _router: Router,
  ) {
    this.config$ = this._store.select(fromStore.getTopbarConfig);
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.activityConfig$ = this._store.select(fromActivityStore.getActivityConfig);

    this.routerEvents$ = this._router.events.subscribe(
      (event: RoutingEvent) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
          if (this.currentRoute.includes('symptoms/add')) {
            if (this.activityConfig.symptomReportSelected) {
              this.activityScope = true;
            }
          }
          else {
            this.activityScope = this.currentRoute.includes('activity/');
            this.settingsScope = this.currentRoute.includes('settings/');
            this.resourcesScope = this.currentRoute.includes('resources/');
          }

          switch(this.currentRoute) {
            case '/welcome':
            case '/home':
            case '/settings':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green'));
              break;

            case '/activity':
            case '/resources':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-beige'));
              break;

            case '/symptoms/add':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-white'));
              break;

            case '/activity/calendar':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple'));
              break;
            case '/activity/dose-report':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue'));
              break;
            case '/activity/dose-report-detail':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-white'));
              break;
            case '/activity/your-progress':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-honey-yellow'));
              break;
            case '/activity/symptom-report':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-tiffany-blue'));
              break;

            case '/resources/your-care-team':
            case '/resources/your-care-team/list':
            case '/resources/your-care-team/detail':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue'));
              break;
            case '/resources/community-feed':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint'));
              break;
            case '/resources/education':
            case '/resources/one-path':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-honey-yellow'));
              break;
            case '/resources/mindful-assistant':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-lime'));
              break;
            case '/resources/mindful-assistant/start':
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green'));
              break;
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

      if (this.currentRoute.includes('symptoms/add')) {
        if (this.activityConfig.symptomReportSelected) {
          this.goTo('activity/symptom-report');
          this._store.dispatch(new fromStore.SliderPageClear());
        }
      }
    }
    else if (this.settingsScope) {
      this.goTo('settings');
    }
    else if (this.resourcesScope) {
      if (
        this.currentRoute.includes('resources/your-care-team') ||
        this.currentRoute.includes('resources/community-feed') ||
        this.currentRoute.includes('resources/education') ||
        this.currentRoute.includes('resources/mindful-assistant') ||
        this.currentRoute.includes('resources/one-path')
      ) {
        if (this.currentRoute.includes('resources/mindful-assistant/start')) {
          this.goTo('resources/mindful-assistant');
          this._store.dispatch(new fromStore.TopbarChangeColor('--color-bg-pastel-lime'));
        }
        else {
          this._store.dispatch(new fromStore.TopbarChangeColor('--color-bg-pastel-beige'));
          this.goTo('resources'); 
        }
      }

      if (this.currentRoute.includes('resources/your-care-team/list')) {
        this.goTo('resources/your-care-team');
      }

      if (this.currentRoute.includes('resources/your-care-team/detail')) {
        this.goTo('resources/your-care-team/list');
        this._store.dispatch(new fromResourcesStore.MemberYouCareTeamSelected(null));
      }
    }
    else {
      // this.goTo('profile');
    }
  }

  goTo(path: string) {
    if (path === 'notifications') {
      this._store.dispatch(new fromStore.TopbarChangeColor('--color-white'));
    }

    if (this.currentRoute.includes('symptoms/add')) {
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
