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
  backdropShow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropShow),
      map((action: fromActions.BackdropShow) => action.payload),
      tap((payload) => {
        if (!this._animationInProgress) {
          this._animationInProgress = true;
          this._backdropOptions = payload;
          if (this._backdropOptions.transition === 'move') {
            animate(
              `#backdrop`,
              { top: '0px' },
              { easing: spring({
                stiffness: 80,
                damping: 20,
                mass: 1,
                velocity: 800,
              }) }
            ).finished.then(() => {
              this._animationInProgress = false;
            });
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
              ).finished.then(() => {
                this._animationInProgress = false;
              });
            })
          }
        }
      })
    )
  }, { dispatch: false });
  backdropClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BackdropClose),
      withLatestFrom(this._store.pipe(select(fromReducer.getBackdropConfig))),
      map(([action, options]) => {
        this._backdropOptions = options;
        return action;
      }),
      tap(() => {
        if (!this._animationInProgress) {
          this._animationInProgress = true;
          const elementSize = window.innerHeight * 0.75;
          if (this._backdropOptions.transition === 'move') {
            if (this._backdropOptions.fullScreen) {
              animate(
                `#backdrop`,
                {
                  top: `${(window.innerHeight) * -1}px`,
                  height: [
                    `${window.innerHeight}px`,
                    `${window.innerHeight * 0.9}px`,
                    `${window.innerHeight * 0.8}px`,
                    `${window.innerHeight * 0.75}px`
                  ] 
                },
                { easing: spring({
                  stiffness: 80,
                  damping: 20,
                  mass: 1,
                  velocity: 800,
                }) },
              ).finished.then(() => {
                this._animationInProgress = false;
              });
            }
            else {
              animate(
                `#backdrop`,
                { top: `${(elementSize) * -1}px` },
                {
                  easing: 'ease-in-out',
                  duration: 0.6,
                } 
              ).finished.then(() => {
                this._animationInProgress = false;
              });
            }
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
              ).finished.then(() => {
                this._animationInProgress = false;
              });
            })
          }
        }
      })
    )
  }, { dispatch: false });

  sliderPageExpandContent$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.SliderPageSetContent),
      withLatestFrom(this._store.pipe(select(fromReducer.getSliderPageConfig))),
      map(([action, options]) => {
        this._sliderPageContentConfig = options;
        return action;
      }),
      tap(() => {
        if (!this._animationInProgress) {
          const easingConfig = {
            stiffness: 80,
            damping: 20,
            mass: 1,
            velocity: 800,
          };
          if (this._sliderPageContentConfig.content.isExpanded) {
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
            ).finished.then(() => {
              this._animationInProgress = false;
            });
          }
          else {
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
            ).finished.then(() => {
              this._animationInProgress = false;
            });

            animate(
              `.slider-page__content .wrapper-large`, 
              { opacity: [ 0.75, 0.5, 0 ] },
              {
                easing: 'ease-in-out',
                duration: 0.2,
              },
            );
          }
        }
      })
    )
  }, { dispatch: false });

  alertShow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.AlertShow),
      map((action: fromActions.AlertShow) => action.payload),
      tap((payload) => {
        if (!this._animationInProgress) {
          this._animationInProgress = true;
          this._alertOptions = payload;
          const heightOfWindow = window.innerHeight;
          if (this._alertOptions.mode === 'full') {
            animate(
              '#alert .alert__content',
              { top: [
                `${heightOfWindow}px`,
                `${(heightOfWindow * 0.75)}px`,
                `${(heightOfWindow * 0.50)}px`,
                `${(heightOfWindow * 0.25)}px`,
                `0px`,
              ] },
              { easing: spring({
                stiffness: 80,
                damping: 20,
                mass: 1,
                velocity: 800,
              }) }
            ).finished.then(() => {
              this._animationInProgress = false;
            });
          }
          else {
            // animate(
            //   `#alert .alert__content`,
            //   { top: '0px' },
            //   { duration: 0 }
            // ).finished.then(() => {
            //   animate(
            //     `#backdrop`, 
            //     { opacity: [ 0.5, 0.8, 1 ]},
            //     { easing: 'ease-in-out', duration: 0.3 }
            //   )
            // })
          }
        }
      })
    )
  }, { dispatch: false });
  alertClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.AlertHide),
      withLatestFrom(this._store.pipe(select(fromReducer.getAlertConfig))),
      map(([action, options]) => {
        this._alertOptions = options;
        return action;
      }),
      tap(() => {
        if (!this._animationInProgress) {
          this._animationInProgress = true;
          if (this._alertOptions.mode === 'full') {
            console.log('hace close in full mode');
            animate(
              `#alert .alert__content`,
              { top: [0, '25%', '50%', '75%', '100%'] },
              { easing: spring({
                stiffness: 80,
                damping: 20,
                mass: 1,
                velocity: 800,
              }) },
            ).finished.then(() => {
              this._animationInProgress = false;
            });
          }
          else {
            console.log('hace close no full mode');
            // animate(
            //   `#backdrop`,
            //   { opacity: [ 0.8, 0.5, 0 ] }, 
            //   { duration: 1 }
            // ).finished.then(() => {
            //   animate(
            //     `#backdrop`,
            //     { top: `${(elementSize) * -1}px` }, 
            //   )
            // })
          }
        }
      })
    )
  }, { dispatch: false });

  private _backdropOptions: any;
  private _sliderPageContentConfig: any;
  private _alertOptions: any;
  private _animationInProgress: boolean = false;

  constructor(
    private actions$: Actions,
    private _store: Store<fromStore.SharedState>,
  ) {}
}
