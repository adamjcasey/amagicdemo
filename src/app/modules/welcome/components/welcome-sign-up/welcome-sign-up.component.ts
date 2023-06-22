import { 
  Component,
  ViewEncapsulation 
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { animate, spring } from 'motion';

import * as fromStore from '@shared/store';

@Component({
  selector: 'automagic-welcome-sign-up',
  templateUrl: 'welcome-sign-up.component.html',
  styleUrls: ['welcome-sign-up.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomeSignUpComponent {
  public signUpFormGroup: FormGroup;

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _formBuilder: FormBuilder,
  ) {
    this.signUpFormGroup = this._formBuilder.group({
      code: ['', [
        Validators.required,
        Validators.pattern(/([0-9]{4})/),
        Validators.minLength(4),
        Validators.maxLength(4),
      ]]
    });
  }

  getPinCode(code: number) {
    this.signUpFormGroup.patchValue({
      code: code
    });
  }

  registerUser() {
    this._store.dispatch(new fromStore.BackdropTopOptions({
      fullScreen: false,
      transition: 'move',
      header: true,
    }));
    this._store.dispatch(new fromStore.BackdropTopContent({
      template: `
        <div class="welcome-backdrop-message">
          <h1 class="font-heading-1--bold">Welcome</h1>
          <p>For this demo, we’ll guide you through the experience using this black backdrop.</p>
          <p>Anything you see on this backdrop would NOT be visible to patients / end users.</p>
        </div>
      `
    })); 

    animate(
      "#backdrop-top",
      { height: [
        `${window.innerHeight}px`,
        `${window.innerHeight * 0.9}px`,
        `${window.innerHeight * 0.8}px`,
        `${window.innerHeight * 0.75}px`
      ] },
      { easing: spring({
        stiffness: 100,
        damping: 15,
        mass: 1,
        velocity: 800,
      }) }
    )
  }
}
