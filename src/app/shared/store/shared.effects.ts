import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { tap, map, withLatestFrom } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { animate, spring  } from 'motion';

import * as fromStore from './shared.store';
import * as fromReducer from './shared.reducer';
import * as fromActions from './shared.actions';

@Injectable()
export class SharedEffects {
  backdropTopShow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropTopShow),
      map((action: fromActions.BackdropTopShow) => action.payload),
      tap((payload) => {
        this._backdropTopOptions = payload;
        if (this._backdropTopOptions.transition === 'move') {
          animate(
            `#backdrop-top`,
            { y: window.innerHeight * 0.75 },
            { easing: spring({
              stiffness: 80,
              damping: 20,
              mass: 1,
              velocity: 800,
            }) }
          )
        }
        else {
          animate(
            `#backdrop-top`,
            { y: window.innerHeight },
            { duration: 0 }
          ).finished.then(() => {
            animate(
              `#backdrop-top`, 
              { opacity: [ 0.5, 0.8, 1 ]},
              { easing: 'ease-in-out', duration: 0.3 }
            )
          })
        }
      })
    )
  }, { dispatch: false });
  backdropTopOptions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropTopOptions),
      map((action: fromActions.BackdropTopOptions) => action.payload),
      tap((payload) => {
        this._backdropTopOptions = payload;
      })
    )
  }, { dispatch: false });

  backdropTopClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropTopClose),
      withLatestFrom(this._store.pipe(select(fromReducer.getBackdropTopConfig))),
      map(([action, options]) => {
        this._backdropTopOptions = options;
        return action;
      }),
      tap(() => {
        if (this._backdropTopOptions.transition === 'move') {
          animate(
            `#backdrop-top`,
            { y: 0 }, 
            {
              easing: 'ease-in-out',
              duration: 0.3,
            },
          ).finished.then(() => {
            this._store.dispatch(new fromActions.BackdropTopContent(null));
          })
        }
        else {
          console.log('close fade');
          animate(
            `#backdrop-top`,
            { opacity: [ 0.8, 0.5, 0 ] }, 
            { duration: 1 }
          ).finished.then(() => {
            animate(
              `#backdrop-top`,
              { y: 0 },
            ).finished.then(() => {
              this._store.dispatch(new fromActions.BackdropTopContent(null));
            })
          })
        }
      })
    )
  }, { dispatch: false });

  backdropBottomShow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropBottomShow),
      map((action: fromActions.BackdropBottomShow) => action.payload),
      tap((payload) => {
        this._backdropBottomOptions = payload;
        animate(
          `#backdrop-bottom`,
          { y: window.innerHeight * 0.75 },
          { 
            easing: spring({
              stiffness: 80,
              damping: 20,
              mass: 1,
              velocity: 800,
            })
          }
        )
      })
    )
  }, { dispatch: false });

  backdropBottomClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropBottomClose),
      map((action: fromActions.BackdropBottomClose) => action),
      tap(() => {
        animate(
          `#backdrop-bottom`,
          { y: 0 }, 
          {
            easing: 'ease-in-out',
            duration: 0.3,
          },
        ).finished.then(() => {
          this._store.dispatch(new fromActions.BackdropBottomContent(null));
        })
      })
    )
  }, { dispatch: false });

  private _backdropTopOptions: any;
  private _backdropBottomOptions: any;

  constructor(
    private actions$: Actions,
    private _store: Store<fromStore.SharedState>,
  ) {}
}
