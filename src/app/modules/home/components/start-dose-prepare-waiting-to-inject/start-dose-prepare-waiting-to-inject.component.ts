import {
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-prepare-waiting-to-inject',
  templateUrl: 'start-dose-prepare-waiting-to-inject.component.html',
  styleUrls: ['start-dose-prepare-waiting-to-inject.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class StartDosePrepareWaitingToInjectComponent
  implements OnInit, AfterViewInit
{
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public timer!: number;

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.sliderPageConfig$ = this._store.select(
      fromSharedStore.getSliderPageConfig
    );
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  }

  ngOnInit() {
    this._store.dispatch(
      new fromCoreStore.SetRightCornerEl({
        display: true,
      })
    );

    this.homeConfig$.subscribe((homeConfig) => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });

    this.sliderPageConfig$.subscribe((sliderPageConfig) => {
      if (sliderPageConfig) {
        this.sliderPageConfig = sliderPageConfig;
      }
    });

    this.layoutConfig$.subscribe((layoutConfig) => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
        if (this.layoutConfig.rightCornerEl) {
          this.timer = this.layoutConfig.rightCornerEl.timer;
          if (this.timer === 0) {
            this.timerIsEnded();
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    // simulate ending timer
    setTimeout(() => {
      this._store.dispatch(
        new fromCoreStore.SetRightCornerEl({
          timer: 3,
        })
      );
    }, 1500);
  }

  timerIsEnded() {
    // enabling of the button on the SliderPage element to continue the flow
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContentOptions({
        toolbar: {
          actions: [
            {
              ...this.sliderPageConfig.content.toolbar.actions[0],
              disabled: null,
            },
          ],
        },
      })
    );

    // hold on for 1second in order to show how is being enable
    // the button on start-dose-prepare-waiting-to-inject
    setTimeout(() => {
      this._store.dispatch(
        new fromSharedStore.AlertShow({
          mode: 'full',
          template: `
          <img src="assets/images/drug-ready-to-inject.svg" />
          <h1 class="font-heading-1--bold">Ready to inject</h1>
          <p>Theryx has reached a comfortable temperature of 65° </p>
        `,
          actions: [
            {
              label: 'Ok, let’s go!',
              fill: 'outline',
              action: () => {
                this._store.dispatch(new fromSharedStore.AlertHide());
                this._store.dispatch(new fromSharedStore.SliderPageClear());
                this._store.dispatch(new fromCoreStore.ClearRightCornerEl());
                this._store.dispatch(
                  new fromCoreStore.Go({
                    path: ['/home/start-dose/ready-to-inject'],
                  })
                );
              },
            },
          ],
        })
      );
    }, 500);
  }
}
