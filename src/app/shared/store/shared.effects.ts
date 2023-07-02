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
      ofType(fromActions.ActionTypes.BackdropShow),
      map((action: fromActions.BackdropShow) => action.payload),
      tap((payload) => {
        this._backdropTopOptions = payload;
        if (this._backdropTopOptions.transition === 'move') {
          animate(
            `#backdrop`,
            { top: '0px' },
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
            `#backdrop`,
            { top: '0px' },
            { duration: 0 }
          ).finished.then(() => {
            animate(
              `#backdrop`, 
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
      ofType(fromActions.ActionTypes.BackdropConfig),
      map((action: fromActions.BackdropConfig) => action.payload),
      tap((payload) => {
        this._backdropTopOptions = payload;
      })
    )
  }, { dispatch: false });
  backdropTopClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropClose),
      withLatestFrom(this._store.pipe(select(fromReducer.getBackdropConfig))),
      map(([action, options]) => {
        this._backdropTopOptions = options;
        return action;
      }),
      tap(() => {
        const element = document.getElementById('backdrop');
        const elementSize = Number(element?.offsetHeight);
        if (this._backdropTopOptions.transition === 'move') {
          animate(
            `#backdrop`,
            { top: `${(elementSize) * -1}px` },
            {
              easing: 'ease-in-out',
              duration: 0.6,
            },
          )
        }
        else {
          animate(
            `#backdrop`,
            { opacity: [ 0.8, 0.5, 0 ] }, 
            { duration: 1 }
          ).finished.then(() => {
            animate(
              `#backdrop`,
              { top: `${(elementSize) * -1}px` }, 
            )
          })
        }
      })
    )
  }, { dispatch: false });

  sliderPageExpandContent$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.SliderPageExpandContent),
      withLatestFrom(this._store.pipe(select(fromReducer.getSliderPageConfig))),
      map(([action, options]) => {
        this._sliderPageContentConfig = options;
        return action;
      }),
      tap(() => {
        const easingConfig = {
          stiffness: 80,
          damping: 20,
          mass: 1,
          velocity: 800,
        };
        if (this._sliderPageContentConfig.content.isExpanded) {
          animate(
            `.slider-page`, 
            { paddingTop: `0px` },
            { easing: spring(easingConfig) }
          );
    
          animate(
            `.slider-page__content`, 
            { height: `${window.innerHeight}px` },
            { easing: spring(easingConfig) }
          );

          animate(
            `.slider-page__content .wrapper-small`, 
            { opacity: [ 0.75, 0.5, 0 ] },
            {
              easing: 'ease-in-out',
              duration: 0.2,
            },
          );
    
          animate(
            `.slider-page__content .wrapper-large`, 
            { opacity: [ 0, 0.5, 1 ] },
            {
              easing: 'ease-in-out',
              duration: 0.4,
            },
          );
        }
        else {
          animate(
            `.slider-page`, 
            { paddingTop: `${window.innerHeight * 0.55}px` },
            { easing: spring(easingConfig) }
          );
    
          animate(
            `.slider-page__content`, 
            { height: `${window.innerHeight * 0.45}px` },
            { easing: spring(easingConfig) }
          );

          animate(
            `.slider-page__content .wrapper-small`, 
            { opacity: [ 0, 0.25, 0.5, 1 ] },
            {
              easing: 'ease-in-out',
              duration: 0.4,
            },
          );

          animate(
            `.slider-page__content .wrapper-large`, 
            { opacity: [ 0.75, 0.5, 0 ] },
            {
              easing: 'ease-in-out',
              duration: 0.2,
            },
          );
        }
      })
    )
  }, { dispatch: false });

  private _backdropTopOptions: any;
  private _sliderPageContentConfig: any;

  constructor(
    private actions$: Actions,
    private _store: Store<fromStore.SharedState>,
  ) {}
}
