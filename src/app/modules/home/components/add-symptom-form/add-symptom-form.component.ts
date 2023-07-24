import { 
  Component,
  ViewEncapsulation, 
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import * as fromCoreStore from '@core/store';
import * as fromActivityStore from '@activity/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-add-symptom-form',
  templateUrl: 'add-symptom-form.component.html',
  styleUrls: ['add-symptom-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddSymptomFormComponent implements OnInit {
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public activityConfig$!: Observable<any>;
  public reportSelected: any;
  public addSymptomFormGroup: FormGroup;
  public symptoms: any[];
  public editView: boolean = false;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
    this.activityConfig$ = this._store.select(fromActivityStore.getActivityConfig);
    this.addSymptomFormGroup = this._formBuilder.group({
      date: ['', ''],
      feelingOverall: [1, [Validators.required]],
      notes: ['', ''],
      symptoms: ['', [Validators.required]],
      severity: [1, [Validators.required]],
      energyLevels: [1, [Validators.required]],
      sleepQuality: [1, [Validators.required]],
    });
    this.symptoms = [
      {
        marked: false,
        label: 'Bloating'
      },
      {
        marked: false,
        label: 'Cramps'
      },
      {
        marked: false,
        label: 'Nausea'
      },
      {
        marked: false,
        label: 'Indigestion'
      },
      {
        marked: false,
        label: 'Acid Reflux'
      },
      {
        marked: false,
        label: 'Diarrhea'
      },
    ];
  }

  ngOnInit() {
    this.sliderPageConfig$.subscribe(sliderPageConfig => {
      if (sliderPageConfig) {
        this.sliderPageConfig = sliderPageConfig;
      }
    });

    this.activityConfig$.subscribe(activityConfig => {
      if (activityConfig) {
        if (activityConfig.symptomReportSelected) {
          this.reportSelected = activityConfig.symptomReportSelected;
          this.addSymptomFormGroup.patchValue({
            ...this.reportSelected,
          });
          this.editView = true;
          this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
            toolbar: null,
          }));
        }
        else {
          this.reportSelected = null;
          this.editView = false;
        }
      }
    });

    this.addSymptomFormGroup.valueChanges.subscribe(() => {
      const actions = this.sliderPageConfig.content.toolbar.actions;
      if (this.addSymptomFormGroup.valid) {
        // this._store.dispatch(new fromActivityStore.SetData({
        //   symptomReportSelected: this.addSymptomFormGroup.value,
        // }));

        this.addSymptomFormGroup.patchValue({
          date: new Date(),
        });

        if ((actions[1].disabled)) {
          this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
            toolbar: {
              actions: [
                actions[0],
                {
                  ...actions[1],
                  disabled: false,
                }
              ]
            }
          }));
        }
      }
      else {
        if (!actions[1].disabled) {
          this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
            toolbar: {
              actions: [
                actions[0],
                {
                  ...actions[1],
                  disabled: true,
                }
              ]
            }
          }));
        }
      }
    });
  }

  markSymptom(event: any, index: number) {
    event.preventDefault();
    this.symptoms[index].marked = !this.symptoms[index].marked;
    this.addSymptomFormGroup.patchValue({
      symptoms: this.symptoms,
    });
  }

  ratingFieldUpdate(event: any, field: string) {
    this.addSymptomFormGroup.get(field)?.setValue(event);
  }

  formatReportDate(date: Date) {
    return moment(date).format('MMM D, H:m A');
  }
}
