import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@home/store';
import * as fromSharedStore from '@shared/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-body-part-selector',
  templateUrl: 'start-dose-ready-to-inject-body-part-selector.component.html',
  styleUrls: ['start-dose-ready-to-inject-body-part-selector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectBodyPartSelectorComponent implements OnInit, OnDestroy {
  public bodyPartSelected!: string;
  public sliderPageConfig$!: Observable<any>;
  public sliderPageConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.sliderPageConfig$ = this._store.select(fromSharedStore.getSliderPageConfig);
  }

  ngOnInit() {
    this.sliderPageConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(sliderPageConfig => {
        if (sliderPageConfig) {
          this.sliderPageConfig = sliderPageConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  onBodyPartSelected(event: any) {
    let clickOnPath = false;
    const coords = {
      x: event.x,
      y: event.y,
    };


    if (coords.x >= 150 && coords.x <= 245) {
      // top-right
      if (coords.x >= 200) {
        if (coords.y >= 335 && coords.y <= 390) {
          clickOnPath = true;
          this.bodyPartSelected = 'top-right';
        }
      }
      // top-left
      else {
        if (coords.y >= 335 && coords.y <= 390) {
          clickOnPath = true;
          this.bodyPartSelected = 'top-left';
        }
      }
    }

    if (coords.x >= 145 && coords.x <= 250) {
      // bottom-right
      if (coords.x >= 195) {
        if (coords.y >= 450 && coords.y <= 510) {
          clickOnPath = true;
          this.bodyPartSelected = 'bottom-right';
        }
      }
      // bottom-left
      else {
        if (coords.y >= 450 && coords.y <= 510) {
          clickOnPath = true;
          this.bodyPartSelected = 'bottom-left';
        }
      }
    }

    this.bodyPartSelected = !clickOnPath ? '' : this.bodyPartSelected;
    this._store.dispatch(new fromStore.SetData({
      bodyPartSelected: this.bodyPartSelected, 
    }));
    this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
      actions: [
        this.sliderPageConfig.content.actions[0],
        {
          ...this.sliderPageConfig.content.actions[1],
          disabled: clickOnPath ? null : true,
        }
      ]
    }));
  }
}
