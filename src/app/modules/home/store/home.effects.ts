import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';

import * as fromStore from './home.store';
import * as fromReducer from './home.reducer';
import * as fromActions from './home.actions';

@Injectable()
export class HomeEffects {
  
  constructor(
    private actions$: Actions,
    private _store: Store<fromStore.HomeState>,
  ) {}
}
