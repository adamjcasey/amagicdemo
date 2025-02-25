import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  BottomToolbarComponent,
  DatepickerComponent,
  PinInputComponent,
  RatingFieldComponent,
} from '@app/shared/components';
import { IonButton, IonContent, IonInput } from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-components',
  templateUrl: 'components.page.html',
  styleUrls: ['components.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    RatingFieldComponent,
    RouterLink,
    BottomToolbarComponent,
    IonInput,
    PinInputComponent,
    DatepickerComponent,
  ],
})
export class ComponentsPage {
  public testFormGroup: FormGroup;
  constructor(
    private _store: Store<fromSharedStore.SharedState>,
    private _formBuilder: FormBuilder
  ) {
    this.testFormGroup = this._formBuilder.group({
      name: ['', [Validators.required]],
    });
  }
}
