import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { tap, map, withLatestFrom } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { animate, spring  } from 'motion';

import * as fromStore from './welcome.store';
import * as fromReducer from './welcome.reducer';
import * as fromActions from './welcome.actions';

@Injectable()
export class WelcomeEffects {
  
  constructor(
    private actions$: Actions,
    private _store: Store<fromStore.WelcomeState>,
  ) {}
}
