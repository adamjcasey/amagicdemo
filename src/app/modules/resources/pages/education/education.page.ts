import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeedCardComponent, HeroComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import { IonContent } from '@ionic/angular/standalone';
import * as fromStore from '@resources/store';

@Component({
  selector: 'automagic-education',
  templateUrl: './education.page.html',
  styleUrls: ['./education.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeroComponent,
    FeedCardComponent,
    IonContent,
  ],
})
export class EducationPage implements OnInit, OnDestroy {
  public resourcesConfig$!: Observable<any>;
  public config: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;
  public posts: any[] = [];

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.resourcesConfig$ = this._store.select(fromStore.getResourcesConfig);
    this.heroConfig = {
      color: '--color-bg-pastel-honey-yellow',
      template: `
        <h1 class="font-heading-1--bold">Education</h1>
      `,
    };
  }

  ngOnInit() {
    this.resourcesConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((resourcesConfig) => {
        if (resourcesConfig.educationFeeds) {
          this.posts = resourcesConfig.educationFeeds.map((post: any) => {
            return {
              ...post,
              type: 'article',
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
