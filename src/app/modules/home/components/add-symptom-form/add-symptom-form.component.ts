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

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
    this.addSymptomFormGroup = this._formBuilder.group({
      feelingOverall: ['', [Validators.required]],
      customNote: ['', [Validators.required]],
      symptoms: ['', [Validators.required]],
      severity: ['', [Validators.required]],
      energyLevels: ['', [Validators.required]],
      sleepQuality: ['', [Validators.required]],
    });
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
}
