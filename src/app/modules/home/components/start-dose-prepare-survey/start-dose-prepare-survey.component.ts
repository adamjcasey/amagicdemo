import { 
  Component,
  ViewEncapsulation, 
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as fromStore from '../../store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-prepare-survey',
  templateUrl: 'start-dose-prepare-survey.component.html',
  styleUrls: ['start-dose-prepare-survey.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDosePrepareSurveyComponent implements OnInit {
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public surveyFormGroup: FormGroup;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.surveyFormGroup = this._formBuilder.group({
      overall: ['', [Validators.required]],
      symptoms: ['', [Validators.required]],
      energyLevel: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });
  }

  ratingFieldUpdate(event: any, field: string) {
    this.surveyFormGroup.get(field)?.setValue(event);
  }
}
