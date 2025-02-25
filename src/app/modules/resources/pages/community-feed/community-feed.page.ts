import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeedCardComponent, HeroComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import * as fromStore from '@resources/store';

@Component({
  selector: 'automagic-community-feed',
  templateUrl: './community-feed.page.html',
  styleUrls: ['./community-feed.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FeedCardComponent,
    HeroComponent,
    IonContent,
    IonIcon,
  ],
})
export class CommunityFeedPage implements OnInit, OnDestroy {
  public resourcesConfig$!: Observable<any>;
  public config: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;
  public posts: any[] = [];

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.resourcesConfig$ = this._store.select(fromStore.getResourcesConfig);
    this.heroConfig = {
      color: '--color-bg-pastel-mint',
      template: `
        <h1 class="font-heading-1--bold">Community Feed</h1>
       `,
    };
  }

  ngOnInit() {
    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((resourcesConfig) => {
        if (resourcesConfig.communityFeeds) {
          this.posts = resourcesConfig.communityFeeds.map((post: any) => {
            return {
              ...post,
              type: 'post',
            };
          });
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }
}
