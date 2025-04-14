import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RatingFieldComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import {
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-start-dose-inject-dose-notes',
  templateUrl: 'start-dose-inject-dose-notes.component.html',
  styleUrls: ['start-dose-inject-dose-notes.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RatingFieldComponent,
    IonCheckbox,
    IonIcon,
    IonInput,
    IonContent,
  ],
})
export class StartDoseInjectDoseNotesFormComponent
  implements OnInit, OnDestroy
{
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public doseNotesFormGroup: FormGroup;
  public symptoms: any[];

  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder
  ) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.doseNotesFormGroup = this._formBuilder.group({
      painful: ['', [Validators.required]],
      mood: ['', [Validators.required]],
      symptoms: this._formBuilder.array([]),
      note: ['', ''],
    });

    this.symptoms = ['Redness', 'Swelling', 'Itching', 'No Reaction'];
  }

  ngOnInit() {
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });

    this.doseNotesFormGroup.valueChanges.subscribe(() => {
      if (this.doseNotesFormGroup.valid) {
        this._store.dispatch(
          new fromStore.SetData({
            doses: this.homeConfig.doses?.map((dose: any, index: number) => {
              const nextDose = this.homeConfig.doses[index + 1];
              if (dose.marked) {
                if (nextDose && !nextDose.marked) {
                  return {
                    marked: dose.marked,
                    date: dose.date,
                    bodyPartInjected: dose.bodyPartInjected,
                    notes: this.doseNotesFormGroup.value,
                  };
                }
              }

              return dose;
            }),
          })
        );
      }
    });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  markReaction(event: any, index: number) {
    event.preventDefault();
    const symptomsField = this.doseNotesFormGroup.get('symptoms') as FormArray;
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
    this.doseNotesFormGroup.get(field)?.setValue(event);
  }

  handlerEnterKey(event: any) {
    const field = event.target;
    field.blur();

    const sliderPageComponent = document.querySelector('.slider-page');
    const submitAction = sliderPageComponent?.querySelector(
      '.wrapper-large__toolbar ion-button:last-child'
    ) as HTMLElement;
    submitAction.click();
  }
}
