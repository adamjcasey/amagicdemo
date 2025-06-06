import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromActivityStore from '@activity/store';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import { IonContent } from '@ionic/angular/standalone';
import * as fromSharedComponents from '@shared/components';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-add-symptom',
  templateUrl: 'add-symptom.page.html',
  styleUrls: ['add-symptom.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    // fromCoreStore.CoreStoreModule,
    fromSharedComponents.RatingFieldComponent,
    fromSharedComponents.SliderPageComponent,
  ],
})
export class AddSymptomPage implements OnInit, OnDestroy {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public slides: Array<any> = [];
  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this._store.dispatch(new fromSharedStore.SliderPageClear());

    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.activityConfig$ = this._store.select(
      fromActivityStore.getActivityConfig
    );
    this.slides = [
      {
        content: {
          isExpanded: true,
          component: 'add-symptom-form',
          template: null,
          toolbar: {
            actions: [
              {
                label: 'Cancel',
                action: () => {
                  if (!this.homeConfig.flareUpsDemoDone) {
                    this._store.dispatch(
                      new fromStore.SetData({
                        flareUpsDemoDone: true,
                      })
                    );
                  }
                  this.goTo('home');
                  this._store.dispatch(new fromSharedStore.SliderPageClear());
                },
              },
              {
                label: 'Save',
                disabled: true,
                action: () => {
                  this.sliderPage.slideNext();
                },
              },
            ],
          },
        },
      },
      {
        content: {
          component: null,
          template: `
            <img src="assets/images/drug-settings.svg" />
            <h1 class="font-heading-1--bold">Symptom Recorded</h1>
            <p>Your new symptom has been successfully recorded.</p>
          `,
          toolbar: {
            actions: [
              {
                label: 'Edit',
                action: () => {
                  this.sliderPage.slidePrev();
                },
              },
              {
                label: 'Got it',
                action: () => {
                  this._store.dispatch(new fromSharedStore.SliderPageClear());
                  if (!this.homeConfig.flareUpsDemoDone) {
                    this._store.dispatch(
                      new fromStore.SetData({
                        flareUpsDemoDone: true,
                      })
                    );
                  }
                  // save the symptom report on activity store
                  this._store.dispatch(
                    new fromActivityStore.SetData({
                      currentSymptomCreating: null,
                      symptomReports: [
                        ...this.activityConfig.symptomReports,
                        this.activityConfig.currentSymptomCreating,
                      ],
                    })
                  );
                  this.goTo('home');
                },
              },
            ],
          },
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

    this.activityConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((activityConfig) => {
        if (activityConfig) {
          this.activityConfig = activityConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  goTo(path: string) {
    this._store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }
}
