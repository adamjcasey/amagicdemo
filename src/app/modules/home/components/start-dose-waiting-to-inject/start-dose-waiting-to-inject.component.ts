import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '../../store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-waiting-to-inject',
  templateUrl: 'start-dose-waiting-to-inject.component.html',
  styleUrls: ['start-dose-waiting-to-inject.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseWaitingToInjectComponent implements OnInit, AfterViewInit {
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public timer!: number;

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
        if (this.layoutConfig.rightCornerEl) {
          this.timer = this.layoutConfig.rightCornerEl.timer;
          if (this.timer === 0) {
            this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
              toolbar: {
                actions: [
                  {
                    ...this.sliderPageConfig.content.toolbar.actions[0],
                    disabled: null
                  },
                ],
              }
            }));

            // hold on for 1second in order to show how is being enable 
            // the button on start-dose-waiting-to-inject
            setTimeout(() => {
              this._store.dispatch(new fromSharedStore.AlertShow({
                mode: 'full',
                template: `
                  <img src="assets/images/drug-ready-to-inject.svg" />
                  <h1 class="font-heading-1--bold">Ready to inject</h1>
                  <p>Theryx has reached a comfortable temperature of 65° </p>
                `,
                buttons: [
                  {
                    label: 'Ok, let’s go!',
                    action: () => {
                      this._store.dispatch(new fromSharedStore.AlertClose());
                    },
                  }
                ],
              }));
            }, 1000);
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    // Simulate ending timer
    setTimeout(() => {
      this._store.dispatch(new fromCoreStore.SetRightCornerEl({
        timer: 5
      }));
    }, 3000);
  }
}
