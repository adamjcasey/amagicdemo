import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-dosing-try-again',
  templateUrl: 'dosing-try-again.component.html',
  styleUrls: ['dosing-try-again.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DosingTryAgainComponent implements OnInit, OnDestroy {
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  public waitingForDeviceConnted: boolean = true;
  public timeOutForRetry: number = 15; // 15segs

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  }

  ngOnInit() {
    this.layoutConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(layoutConfig => {
        if (layoutConfig) {
          this.layoutConfig = layoutConfig;
        }
      });

    console.log('inicia interval');
    const controller = setInterval(() => {
      console.log('this.timeOutForRetry ', this.timeOutForRetry);
      console.log('dosageDevice.isConnected ', this.layoutConfig.dosageDevice.isConnected);
      this.timeOutForRetry = this.timeOutForRetry - 1;

      if (this.layoutConfig.dosageDevice.isConnected || this.timeOutForRetry === 0) {
        this.waitingForDeviceConnted = false;
        clearInterval(controller);
      }
    }, 1000);
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  retryInjection() {
    this._store.dispatch(new fromSharedStore.BackdropHide);
  }
}
