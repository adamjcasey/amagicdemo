import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { tap, map } from 'rxjs/operators';

import * as fromActions from './core.actions';

@Injectable()
export class CoreEffects {
  navigate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.Go),
      map((action: fromActions.Go) => action.payload),
      tap(({ path, query: queryParams, extras }) => {
        this._router.navigate(path, { queryParams, ...extras })
      })
    )
  }, { dispatch: false });

  navigateForward$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.Forward),
      map((action: fromActions.Forward) => action),
      tap(() => this._location.forward())
    )
  }, { dispatch: false });

  navigateBack$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.Back),
      map((action: fromActions.Back) => action),
      tap(() => this._location.back())
    )
  }, { dispatch: false });

  constructor(
    private actions$: Actions,
    private _router: Router,
    private _location: Location
  ) {}
}
