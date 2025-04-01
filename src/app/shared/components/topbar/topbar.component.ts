import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, Event as RoutingEvent } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromActivityStore from '@activity/store';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SecondsToMinutesPipe } from '@app/shared/pipes';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from '@ionic/angular/standalone';
import * as fromResourcesStore from '@resources/store';
import * as fromSharedStore from '@shared/store';
import * as fromStore from '@shared/store';
import { addIcons } from 'ionicons';
import { chevronBackOutline, hammerOutline } from 'ionicons/icons';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { LogButtonComponent } from '../log-button/log-button.component';

@Component({
  selector: 'automagic-topbar',
  templateUrl: 'topbar.component.html',
  styleUrls: ['topbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackdropComponent,
    SecondsToMinutesPipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenuButton,
    LogButtonComponent,
  ],
})
export class TopBarComponent implements OnInit, OnDestroy {
  public config$!: Observable<any>;
  public config: any;
  public bottomToolbarConfig$!: Observable<any>;
  public bottomToolbarConfig: any;
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public resourcesConfig$!: Observable<any>;
  public resourcesConfig: any;
  public activityScope: boolean = false;
  public settingsScope: boolean = false;
  public resourcesScope: boolean = false;
  public currentRoute: string = '';
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) {
    addIcons({
      chevronBackOutline,
      hammerOutline,
    });

    this.config$ = this._store.select(fromStore.getTopbarConfig);
    this.bottomToolbarConfig$ = this._store.select(
      fromStore.getBottomToolbarConfig
    );
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.activityConfig$ = this._store.select(
      fromActivityStore.getActivityConfig
    );
    this.resourcesConfig$ = this._store.select(
      fromResourcesStore.getResourcesConfig
    );

    this._router.events
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((event: RoutingEvent) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
          if (this.currentRoute.includes('symptoms/add')) {
            if (this.activityConfig.symptomReportSelected) {
              this.activityScope = true;
            }
          } else {
            this.activityScope = this.currentRoute.includes('activity/');
            this.resourcesScope = this.currentRoute.includes('resources/');

            if (this.currentRoute.includes('settings/setup-reminders')) {
              this.settingsScope = !this.homeConfig.firstTimeDose
                ? true
                : false;
            } else {
              this.settingsScope = this.currentRoute.includes('settings/');
            }
          }

          switch (this.currentRoute) {
            case '/welcome':
            case '/home':
            case '/settings':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green')
              );
              break;

            case '/activity':
            case '/resources':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-bg-pastel-beige')
              );
              break;

            case '/symptoms/add':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-white')
              );
              break;

            case '/activity/calendar':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor(
                  '--color-bg-pastel-purple'
                )
              );
              break;
            case '/activity/dose-report':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue')
              );
              break;
            case '/activity/dose-report-detail':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-white')
              );
              break;
            case '/activity/your-progress':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor(
                  '--color-bg-pastel-honey-yellow'
                )
              );
              break;
            case '/activity/symptom-report':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor(
                  '--color-bg-pastel-tiffany-blue'
                )
              );
              break;

            case '/resources/your-care-team':
            case '/resources/your-care-team/list':
            case '/resources/your-care-team/detail':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-bg-pastel-blue')
              );
              break;
            case '/resources/community-feed':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-bg-pastel-mint')
              );
              break;
            case '/resources/education':
            case '/resources/one-path':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor(
                  '--color-bg-pastel-honey-yellow'
                )
              );
              break;
            case '/resources/mindful-assistant':
              this._store.dispatch(
                new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green')
              );
              // Old version
              // this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-lime'));
              break;
            // Old version
            // case '/resources/mindful-assistant/start':
            //   this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green'));
            //   break;
          }
        }
      });
  }

  ngOnInit() {
    this.config$.pipe(takeUntil(this._ngUnsubscribe)).subscribe((config) => {
      if (config) {
        this.config = config;
      }
    });

    this.bottomToolbarConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((bottomToolbarConfig) => {
        if (bottomToolbarConfig) {
          this.bottomToolbarConfig = bottomToolbarConfig;
        }
      });

    this.layoutConfig$ = this._store
      .select(fromCoreStore.getLayoutConfig)
      .pipe(takeUntil(this._ngUnsubscribe));

    this.layoutConfig$.subscribe((config) => {
      this.layoutConfig = config;
      // Manually trigger change detection after the value is updated
      this._cdr.detectChanges();
    });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });

    this.activityConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((activityConfig) => {
        if (activityConfig) {
          this.activityConfig = activityConfig;
        }
      });

    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((resourcesConfig) => {
        if (resourcesConfig) {
          this.resourcesConfig = resourcesConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  leftElementHandler() {
    if (this.activityScope) {
      if (this.currentRoute.includes('activity/calendar')) {
        if (!this.bottomToolbarConfig.show) {
          this._store.dispatch(new fromSharedStore.BottomToolbarShow());
        }
        this.goTo('activity');
      }

      if (
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
    } else if (this.settingsScope) {
      this.goTo('settings');
    } else if (this.resourcesScope) {
      if (
        this.currentRoute.includes('resources/your-care-team') ||
        this.currentRoute.includes('resources/community-feed') ||
        this.currentRoute.includes('resources/education') ||
        this.currentRoute.includes('resources/mindful-assistant') ||
        this.currentRoute.includes('resources/one-path')
      ) {
        // Old version
        // if (this.currentRoute.includes('resources/mindful-assistant/start')) {
        //   this.goTo('resources/mindful-assistant');
        //   this._store.dispatch(new fromStore.TopbarChangeColor('--color-bg-pastel-lime'));
        // }
        // else {
        //   this._store.dispatch(new fromStore.TopbarChangeColor('--color-bg-pastel-beige'));
        //   this.goTo('resources');
        // }
        this._store.dispatch(
          new fromStore.TopbarChangeColor('--color-bg-pastel-beige')
        );
        this.goTo('resources');
      }

      if (this.currentRoute.includes('resources/your-care-team/list')) {
        const yourCareteam = this.resourcesConfig.yourCareTeam;
        let path = 'resources/your-care-team';
        if (
          yourCareteam.myTeam.length > 0 ||
          yourCareteam.caregivers.length > 0
        ) {
          path = 'resources';
        }
        this.goTo(path);
      }

      if (this.currentRoute.includes('resources/your-care-team/detail')) {
        this.goTo('resources/your-care-team/list');
        this._store.dispatch(
          new fromResourcesStore.MemberYouCareTeamSelected(null)
        );
      }
    } else {
      // this.goTo('profile');
    }
  }

  goTo(path: string) {
    if (path === 'notifications') {
      this._store.dispatch(new fromStore.TopbarChangeColor('--color-white'));
    }

    if (this.currentRoute.includes('symptoms/add')) {
      if (this.activityConfig.symptomReportSelected) {
        this._store.dispatch(
          new fromActivityStore.SetData({
            symptomReportSelected: null,
          })
        );
      }
    }

    this._store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }
}
