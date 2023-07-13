import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-components',
  templateUrl: 'components.page.html',
  styleUrls: ['components.page.scss'],
})
export class ComponentsPage {
  public testFormGroup: FormGroup;
  constructor(
    private _store: Store<fromSharedStore.SharedState>,
    private _formBuilder: FormBuilder,
  ) {
    this.testFormGroup = this._formBuilder.group({
      name: ['', [Validators.required]],
    });
  }

}
