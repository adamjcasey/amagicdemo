import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@resources/store';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';

@Component({
  selector: 'automagic-your-care-team-list',
  templateUrl: './your-care-team-list.page.html',
  styleUrls: ['./your-care-team-list.page.scss'],
})
export class YourCareTeamListPage implements OnInit, OnDestroy {
  public resourcesConfig$!: Observable<any>;
  public config: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;
  public myTeam: any;
  public caregivers: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.resourcesConfig$ = this._store.select(fromStore.getResourcesConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.heroConfig = {
      color: '--color-bg-pastel-blue',
      template: `
        <h1 class="font-heading-1--bold">Your Care Team</h1>
      `,
    }
  }

  ngOnInit() {
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
          if (!resourcesConfig.yourCareTeamPageVisited && this.homeConfig) {
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

          this.config = resourcesConfig.yourCareTeam;
          if (this.config) {
            this.myTeam = this.config.myTeam.map((member: any) => {
              return {
                ...member,
                type: 'contact',
                title: member.name,
                asset: member.photo,
                position: member.role,
                onClick: () => {
                  this._store.dispatch(new fromStore.MemberYouCareTeamSelected(member));
                  this.goTo('resources/your-care-team/detail');
                }
              }
            });
            this.caregivers = this.config.caregivers.map((member: any) => {
              return {
                ...member,
                type: 'contact',
                title: member.name,
                asset: member.photo,
                position: member.role,
                onClick: () => {
                  this._store.dispatch(new fromStore.MemberYouCareTeamSelected(member));
                  this.goTo('resources/your-care-team/detail');
                }
              }
            });
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
