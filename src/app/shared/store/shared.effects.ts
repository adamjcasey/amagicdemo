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
      withLatestFrom(this._store.pipe(select(fromReducer.getBackdropConfig))),
      map(([action, options]) => {
        this._backdropOptions = options;
        return action;
      }),
      map((action: fromActions.BackdropShow) => action.payload),
      tap((payload) => {
        this._backdropOptions = payload;
        if (this._backdropOptions.transition === 'move') {
          if (!this._backdropOptions.fullScreen) {
            document.getElementById('backdrop')?.removeAttribute('style');
          }

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
            if (typeof this._backdropOptions.onOpen === 'function') {
              this._backdropOptions.onOpen();
            }
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
              if (typeof this._backdropOptions.onOpen === 'function') {
                this._backdropOptions.onOpen();
              }
            });
          })
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
        const wrapper = document.querySelector('#backdrop .backdrop__wrapper') as HTMLElement;
        const content = document.querySelector('#backdrop .backdrop__content') as HTMLElement;
        if (this._backdropOptions.transition === 'move') {
          if (this._backdropOptions.fullScreen) {
            animate(
              `#backdrop`,
              { top: `${(window.innerHeight) * -1}px` },
              { easing: spring({
                stiffness: 80,
                damping: 20,
                mass: 1,
                velocity: 800,
              }) },
            ).finished.then(() => {
              if (typeof this._backdropOptions.onClose === 'function') {
                this._backdropOptions.onClose();
              }
            });

            animate(
              `#backdrop .backdrop__content`,
              { height: [
                `${window.innerHeight}px`,
                `${window.innerHeight * 0.9}px`,
                `${window.innerHeight * 0.8}px`,
                `${window.innerHeight * 0.75}px`
              ] },
              { easing: spring({
                stiffness: 80,
                damping: 20,
                mass: 1,
                velocity: 800,
              }) },
            );
          }
          else {
            animate(
              `#backdrop`,
              { top: `${(wrapper.offsetHeight) * -1}px` },
              {
                easing: 'ease-in-out',
                duration: 0.6,
              } 
            ).finished.then(() => {
              // clean-up height style inline set in previous animations
              content.style.removeProperty('height');

              if (typeof this._backdropOptions.onClose === 'function') {
                this._backdropOptions.onClose();
              }
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
              { top: `${(wrapper.offsetHeight) * -1}px` }, 
            );

            // clean-up height style inline set in previous animations
            content.style.removeProperty('height');

            if (typeof this._backdropOptions.onClose === 'function') {
              this._backdropOptions.onClose();
            }
          })
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
          );
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

  alertShow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.AlertShow),
      withLatestFrom(this._store.pipe(select(fromReducer.getAlertConfig))),
      map(([action, options]) => {
        this._alertOptions = options;
        return action;
      }),
      map((action: fromActions.AlertShow) => action.payload),
      tap(() => {
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
            if (typeof this._alertOptions.onShow === 'function') {
              this._alertOptions.onShow();
            }
          });
        }
      })
    )
  }, { dispatch: false });
  alertClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.AlertClose),
      withLatestFrom(this._store.pipe(select(fromReducer.getAlertConfig))),
      map(([action, options]) => {
        this._alertOptions = options;
        return action;
      }),
      tap(() => {
        if (this._alertOptions.mode === 'full') {
          animate(
            '#alert .alert__content',
            { top: [0, '25%', '50%', '75%', '100%'] },
            { easing: spring({
              stiffness: 80,
              damping: 20,
              mass: 1,
              velocity: 800,
            }) },
          ).finished.then(() => {
            document.querySelector('#alert .alert__content')?.removeAttribute('style');
            if (typeof this._alertOptions.onClose === 'function') {
              this._alertOptions.onClose();
            }
          });
        }
      })
    )
  }, { dispatch: false });

  bottomToolbarShow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BottomToolbarHide),
      map((action: fromActions.BottomToolbarHide) => action.payload),
      tap((show) => {
        const element = document.getElementById('bottom-toolbar') as HTMLElement;
        if (!show) {
          if (element.style.getPropertyValue('display') === 'none') {
            element.style.removeProperty('display');
          }

          animate(
            '#bottom-toolbar',
            { y: [
              `${(element?.clientHeight + 30)}px`,
              `${(element?.clientHeight * 0.9)}px`,
              `${(element?.clientHeight * 0.75)}px`,
              `${(element?.clientHeight * 0.5)}px`,
              `${(element?.clientHeight * 0.25)}px`,
              `0px`,
            ] },
            { easing: spring({
              stiffness: 80,
              damping: 20,
              mass: 1,
              velocity: 800,
            }) }
          );
        }
        else {
          animate(
            '#bottom-toolbar',
            { y: [
              '0px', 
              '25%', 
              '50%', 
              '75%', 
              `${(element?.clientHeight + 30)}px`,
            ] },
            { easing: spring({
              stiffness: 80,
              damping: 20,
              mass: 1,
              velocity: 800,
            }) },
          ).finished.then(() => {
            element.style.display = 'none';
          });
        }
      })
    )
  }, { dispatch: false });
  bottomToolbarHide$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.ActionTypes.BottomToolbarHide),
      tap(() => {
        const element = document.getElementById('bottom-toolbar') as HTMLElement;
        

        
      })
    )
  }, { dispatch: false });

  private _backdropOptions: any;
  private _sliderPageContentConfig: any;
  private _alertOptions: any;

  constructor(
    private actions$: Actions,
    private _store: Store<fromStore.SharedState>,
  ) {}
}
