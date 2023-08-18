import { 
  Component,
  ViewEncapsulation 
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { animate, spring } from 'motion';

import * as fromStore from '../../store';
import * as fromStoreShared from '@shared/store';

@Component({
  selector: 'automagic-welcome-sign-up',
  templateUrl: 'welcome-sign-up.component.html',
  styleUrls: ['welcome-sign-up.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomeSignUpComponent {
  public signUpFormGroup: FormGroup;
  public pinInvalid: boolean = false;
  public allowedCodes: string[];

  constructor(
    private _store: Store<fromStore.WelcomeState>,
    private _formBuilder: FormBuilder,
  ) {
    this.allowedCodes = [
      '7897',
      '1022',
      '0511',
      '5272',
      '3572',
    ];
    this.signUpFormGroup = this._formBuilder.group({
      code: ['', [
        Validators.required,
        Validators.pattern(/([0-9]{4})/),
        Validators.minLength(4),
      ]]
    });
  }

  getPinCode(data: any) {
    this.signUpFormGroup.patchValue({
      code: data.value
    });

    if (data.submit) {
      this.registerUser();
    }
  }

  getPinError(error: boolean) {
    this.pinInvalid = error;
  }

  registerUser() {
    this._store.dispatch(new fromStore.SetData({
      pin: this.signUpFormGroup.value.code
    }));

    this._store.dispatch(new fromStoreShared.BackdropSetConfig({
      fullScreen: false,
      transition: 'move',
      header: true,
      showBackButton: false,
      template: `
        <div class="welcome-backdrop-message">
          <h1 class="font-heading-1--bold">Welcome</h1>
          <p>For this demo, this black overlay will sometimes appear to provide additional context.</p>
          <p>You can access it at any  time by clicking the 'i' at the top.</p>
          <p>Anything you see on this overlay would NOT be visible to patients / end users.</p>
        </div>
      `,
    }));

    animate(
      '#backdrop .backdrop__wrapper',
      { height: [
        `${window.innerHeight}px`,
        `${window.innerHeight * 0.95}px`,
        `${window.innerHeight * 0.9}px`,
        `${window.innerHeight * 0.85}px`,
        `${window.innerHeight * 0.8}px`,
        `${window.innerHeight * 0.75}px`
      ] },
      { easing: spring({
        stiffness: 100,
        damping: 15,
        mass: 1,
        velocity: 800,
      }) }
    );
  }
}
