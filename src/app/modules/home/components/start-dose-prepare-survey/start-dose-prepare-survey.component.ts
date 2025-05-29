import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RatingFieldComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import { IonContent } from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';
import * as fromStore from '../../store';

@Component({
  selector: 'automagic-start-dose-prepare-survey',
  templateUrl: 'start-dose-prepare-survey.component.html',
  styleUrls: ['start-dose-prepare-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RatingFieldComponent,
    IonContent,
  ],
})
export class StartDosePrepareSurveyComponent implements OnInit {
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public surveyFormGroup: FormGroup;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _formBuilder: FormBuilder
  ) {
    this.sliderPageConfig$ = this._store.select(
      fromSharedStore.getSliderPageConfig
    );
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.surveyFormGroup = this._formBuilder.group({
      overall: ['', [Validators.required]],
      symptoms: ['', [Validators.required]],
      energyLevel: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.homeConfig$.subscribe((homeConfig) => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });
  }

  ratingFieldUpdate(event: any, field: string) {
    this.surveyFormGroup.get(field)?.setValue(event);
  }
}
