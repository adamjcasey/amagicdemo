import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@resources/store';
import * as fromCoreStore from '@core/store';
import * as fromWelcomeStore from '@welcome/store';
import * as fromHomeStore from '@home/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-your-care-team',
  templateUrl: './your-care-team.page.html',
  styleUrls: ['./your-care-team.page.scss'],
})
export class YourCareTeamPage implements OnInit, OnDestroy {
  public welcomeConfig$!: Observable<any>;
  public name: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public resourcesConfig$!: Observable<any>;
  public resourcesConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.welcomeConfig$ = this._store.select(fromWelcomeStore.getWelcomeConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.resourcesConfig$ = this._store.select(fromStore.getResourcesConfig);
    this.heroConfig = {
      color: '--color-bg-pastel-blue',
      template: `
        <h1 class="font-heading-1--bold">Your Care Team</h1>
      `
    }
  }

  ngOnInit() {
    this.welcomeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(welcomeConfig => {
        if (welcomeConfig) {
          this.name = welcomeConfig.name;
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });

    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(resourcesConfig => {
        if (resourcesConfig) {
          this.resourcesConfig = resourcesConfig;
          if (!this.resourcesConfig.yourCareTeamPageVisited && this.homeConfig) {
            const onBoardingTasks = this.homeConfig.onBoardingTasks.map((task: any) => {
              return {
                ...task,
              }
            });
            onBoardingTasks[5].completed = true;
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

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
