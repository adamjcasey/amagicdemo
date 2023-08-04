import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromSharedStore from '@shared/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-prepare-temp-timer',
  templateUrl: 'start-dose-prepare-temp-timer.component.html',
  styleUrls: ['start-dose-prepare-temp-timer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDosePrepareTempTimerComponent implements OnInit, AfterViewInit {
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public limitTime: number = 720; // 720segs - 12min

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  }

  ngOnInit() {
    this.sliderPageConfig$.subscribe(sliderPageConfig => {
      if (sliderPageConfig) {
        this.sliderPageConfig = sliderPageConfig;
      }
    });

    this.layoutConfig$.subscribe(layoutConfig => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
        if (this.layoutConfig.rightCornerEl?.timer) {
          if (this.limitTime !== this.layoutConfig.rightCornerEl?.timer) {
            this.limitTime = this.layoutConfig.rightCornerEl.timer;
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.startTimer();
    // keep a moment to allow some reading of the content: 3segs
    setTimeout(() => {
      this._store.dispatch(new fromSharedStore.BackdropShow({
        transition: 'move',
        fullScreen: true,
        header: true,
        bgTemplate: 'bottom-hole',
        template: `
          <h1 class="font-heading-1--bold">No need to wait!</h1>
          <p>For this demo we’ve sped up the<br> warming time.</p>
        `,
        buttons: [
          {
            label: 'Got it',
            cssClasses: 'action-to-highlight',
            action: () => {
              this._store.dispatch(new fromSharedStore.BackdropHide);
            },
          }
        ]
      }));

      // slow delay of 800ms around 70% of the duration of Backdrop showing animation
      // to change the content of the SlidePage and avoid small jumps
      // enable toolbar button but keeping same
      setTimeout(() => {
        this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
          template: null,
          component: 'start-dose-prepare-setup',
          toolbar: {
            actions: [ 
              {
                ...this.sliderPageConfig.content.toolbar.actions[0],
                disabled: false,
              }
            ]
          }
        }));
      }, 300);
    }, 1500);
  }

  startTimer() {
    this._store.dispatch(new fromCoreStore.SetRightCornerEl({
      type: 'timer',
      timer: this.limitTime,
    }));

    const loop = setInterval(() => {
      this.limitTime--;
      this._store.dispatch(new fromCoreStore.SetRightCornerEl({
        timer: this.limitTime,
      }));

      if (this.limitTime === 0) {
        this._store.dispatch(new fromCoreStore.ClearRightCornerEl());
        clearInterval(loop);
      }
    }, 1000);
  }
}
