import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '@home/store';
import * as fromActivityStore from '@activity/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedComponents from '@shared/components';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-add-symptom',
  templateUrl: 'add-symptom.page.html',
  styleUrls: ['add-symptom.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddSymptomPage implements OnInit {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public activityConfig$!: Observable<any>;
  public activityConfig: any;
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public slides: Array<any> = [];
  @ViewChild('sliderPage', { static: false }) sliderPage!: fromSharedComponents.SliderPageComponent;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.activityConfig$ = this._store.select(fromActivityStore.getActivityConfig);
    this.slides = [
      {
        content: {
          isExpanded: true,
          component: 'add-symptom-form',
          toolbar: { 
            actions: [
              {
                label: 'Cancel',
                action: () => {
                  this.goTo('home');
                  this._store.dispatch(new fromSharedStore.SliderPageClear());
                },
              },
              {
                label: 'Save',
                disabled: true,
                action: () => { 
                  this.sliderPage.slideNext();
                }
              }
            ]
          }
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
                    this._store.dispatch(new fromStore.SetData({
                      flareUpsDemoDone: true
                    }));
                  }
                  // save the symptom report on activity store
                  this._store.dispatch(new fromActivityStore.SetData({
                    symptomReports: [
                      ...this.activityConfig.symptomReports, 
                      this.activityConfig.currentSymptomReport
                    ],
                  }));
                  this.goTo('home');
                }
              }
            ]
          }
        },
      },
    ];
  }

  ngOnInit() {
    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });

    this.activityConfig$.subscribe(activityConfig => {
      if (activityConfig) {
        this.activityConfig = activityConfig;
      }
    });
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
