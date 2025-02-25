import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import { IonContent } from '@ionic/angular/standalone';
import * as fromStore from '@resources/store';
import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-resources',
  templateUrl: 'resources.page.html',
  styleUrls: ['resources.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    IonContent,
  ],
})
export class ResourcesPage implements OnInit, AfterViewInit, OnDestroy {
  public resourcesConfig$!: Observable<any>;
  public resourcesConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public cards: any[];

  constructor(
    private _utils: fromSharedServices.UtilsService,
    private _store: Store<fromCoreStore.CoreState>
  ) {
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.resourcesConfig$ = this._store.select(fromStore.getResourcesConfig);
    this.cards = [
      {
        type: 'simple',
        title: 'Care Team',
        asset: '/assets/images/resources-entry-care-team.svg',
        description: 'Connect to your health care providers for holistic care.',
        action: () => {
          this.goTo('resources/your-care-team');
        },
      },
      {
        type: 'simple',
        title: 'Community Feed',
        asset: '/assets/images/resources-entry-community-feed.svg',
        description:
          'Connect to a larger community of fellow patients to learn tips and tricks.',
        action: () => {
          this.goTo('resources/community-feed');
        },
      },
      {
        type: 'simple',
        title: 'Education',
        asset: '/assets/images/resources-entry-education.svg',
        description:
          'Stay up-to-date and learn more about your condition and treatment.',
        action: () => {
          this.goTo('resources/education');
        },
      },
      {
        type: 'simple',
        title: 'Mindful Assistant',
        asset: '/assets/images/resources-entry-mindful-assistant.svg',
        description:
          'Use Headspace to help navigate the stress and anxiety of chronic conditions.',
        action: () => {
          this.goTo('/resources/mindful-assistant');
        },
      },
      {
        type: 'simple',
        title: 'OnePath',
        asset: '/assets/images/resources-entry-one-path.svg',
        description: 'Chat with your patient support manager (PSM).',
        action: () => {
          this.goTo('/resources/one-path');
        },
      },
    ];
  }

  ngOnInit() {
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });

    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((resourcesConfig) => {
        if (resourcesConfig) {
          this.resourcesConfig = resourcesConfig;
          if (!this.resourcesConfig.entryPageVisited && this.homeConfig) {
            const onBoardingTasks = this.homeConfig.onBoardingTasks.map(
              (task: any) => {
                return {
                  ...task,
                };
              }
            );
            onBoardingTasks[4].completed = true;
            this._store.dispatch(
              new fromHomeStore.SetData({
                onBoardingTasks: onBoardingTasks,
              })
            );
          }
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  ngAfterViewInit() {
    const container = document.querySelector(
      '.resources-page__container'
    ) as HTMLElement;
    if (container) {
      this._utils.createMasonryLayout(container);
    }
  }

  goTo(path: string) {
    if (path === 'resources/your-care-team') {
      const yourCareteam = this.resourcesConfig.yourCareTeam;
      if (
        yourCareteam.myTeam.length > 0 ||
        yourCareteam.caregivers.length > 0
      ) {
        path += '/list';
      }
    }

    this._store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }
}
