import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromActivityStore from '@activity/store';
import { CommonModule } from '@angular/common';
import { RatingFieldComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import {
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-add-symptom-form',
  templateUrl: 'add-symptom-form.component.html',
  styleUrls: ['add-symptom-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonCheckbox,
    IonIcon,
    IonInput,
    IonContent,
    RatingFieldComponent,
  ],
})
export class AddSymptomFormComponent implements OnInit, OnDestroy {
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public activityConfig$!: Observable<any>;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public reportSelected: any;
  public addSymptomFormGroup: FormGroup;
  public symptoms: string[];
  public detailView: boolean = false;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder
  ) {
    this.sliderPageConfig$ = this._store.select(
      fromSharedStore.getSliderPageConfig
    );
    this.activityConfig$ = this._store.select(
      fromActivityStore.getActivityConfig
    );
    this.addSymptomFormGroup = this._formBuilder.group({
      date: ['', ''],
      feelingOverall: [1, [Validators.required]],
      notes: ['', ''],
      symptoms: this._formBuilder.array([]),
      severity: [1, [Validators.required]],
      energyLevels: [1, [Validators.required]],
      sleepQuality: [1, [Validators.required]],
    });
    this.symptoms = [
      'Bloating',
      'Cramps',
      'Nausea',
      'Indigestion',
      'Acid Reflux',
      'Diarrhea',
    ];
  }

  ngOnInit() {
    this.sliderPageConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((sliderPageConfig) => {
        if (sliderPageConfig) {
          this.sliderPageConfig = sliderPageConfig;
        }
      });

    this.activityConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((activityConfig) => {
        if (activityConfig) {
          if (activityConfig.symptomReportSelected) {
            this.detailView = true;
            this.reportSelected = activityConfig.symptomReportSelected;
            this.addSymptomFormGroup.patchValue({
              ...this.reportSelected,
            });
            this._store.dispatch(
              new fromSharedStore.SliderPageSetContentOptions({
                toolbar: null,
              })
            );
          } else {
            this.detailView = false;
            this.reportSelected = null;
          }
        }
      });

    this.addSymptomFormGroup.valueChanges.subscribe(() => {
      if (this.sliderPageConfig.content.toolbar) {
        const actions = this.sliderPageConfig.content.toolbar.actions;
        if (actions) {
          if (this.addSymptomFormGroup.valid) {
            if (!this.detailView) {
              this._store.dispatch(
                new fromActivityStore.SetData({
                  currentSymptomCreating: {
                    ...this.addSymptomFormGroup.value,
                  },
                })
              );

              if (this.addSymptomFormGroup.get('date')?.value === '') {
                this.addSymptomFormGroup.patchValue({
                  date: new Date(),
                });
              }

              if (actions[1].disabled) {
                this._store.dispatch(
                  new fromSharedStore.SliderPageSetContentOptions({
                    toolbar: {
                      actions: [
                        actions[0],
                        {
                          ...actions[1],
                          disabled: false,
                        },
                      ],
                    },
                  })
                );
              }
            }
          } else {
            if (!actions[1].disabled) {
              this._store.dispatch(
                new fromSharedStore.SliderPageSetContentOptions({
                  toolbar: {
                    actions: [
                      actions[0],
                      {
                        ...actions[1],
                        disabled: true,
                      },
                    ],
                  },
                })
              );
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  markSymptom(event: any, index: number) {
    event.preventDefault();
    const symptomsField = this.addSymptomFormGroup.get('symptoms') as FormArray;
    if (!symptomsField?.value.includes(this.symptoms[index])) {
      symptomsField.push(this._formBuilder.control(this.symptoms[index]));
    } else {
      const indexToDelete = symptomsField.value.findIndex(
        (symptom: string) => symptom === this.symptoms[index]
      );
      symptomsField.removeAt(indexToDelete);
    }
  }

  ratingFieldUpdate(event: any, field: string) {
    this.addSymptomFormGroup.get(field)?.setValue(event);
  }

  formatReportDate(date: Date) {
    return moment(date).format('MMM D, H:mm A');
  }

  handlerEnterKey(event: any) {
    const field = event.target;
    field.blur();
  }
}
