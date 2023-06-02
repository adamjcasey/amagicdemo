import { 
  Component,
  ViewEncapsulation 
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from "@ngrx/store";

import * as fromStore from '@shared/store';

@Component({
  selector: 'automagic-welcome-test',
  templateUrl: 'welcome-test.component.html',
  styleUrls: ['welcome-test.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomeTestComponent {
  public signUpFormGroup: FormGroup;

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _formBuilder: FormBuilder,
  ) {
    this.signUpFormGroup = this._formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$')
      ]]
    });
  }

  registerEmail() {
    this._store.dispatch(new fromStore.OverlayOptions({
      transition: 'move',
      fullScreen: false,
      showHeader: true,
    }));
    this._store.dispatch(new fromStore.OverlayContent(`
      <div class="welcome-overlay-message">
        <h1 class="font-heading-1--bold">Welcome</h1>
        <p>For this demo, we’ll guide you through the experience using this black overlay.</p>
        <p>Anything you see on this overlay would NOT be visible to patients / end users.</p>
      </div>
    `));
  }

}
