import { 
  Component,
  ViewEncapsulation, 
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromCoreStore from '@core/store';
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
  public addSymptomFormGroup: FormGroup;
  public symptoms: any[];

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
    this.addSymptomFormGroup = this._formBuilder.group({
      feelingOverall: [1, [Validators.required]],
      customNote: ['', ''],
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

    this.addSymptomFormGroup.valueChanges.subscribe(() => {
      const actions = this.sliderPageConfig.content.toolbar.actions;
      if (this.addSymptomFormGroup.valid) {
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
}
