import {
  AfterContentInit,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromCoreStore from '@core/store';
import * as fromHomeStore from '@home/store';
import { IonButton } from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-dosing-try-again',
  templateUrl: 'dosing-try-again.component.html',
  styleUrls: ['dosing-try-again.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonButton],
})
export class DosingTryAgainComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  public waitingForDeviceConnected: boolean = true;
  public timeOutForRetry: number = 15; // 15segs

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
  }

  ngOnInit() {
    this.layoutConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((layoutConfig) => {
        if (layoutConfig) {
          this.layoutConfig = layoutConfig;
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });
  }

  ngAfterContentInit() {
    const controller = setInterval(() => {
      this.timeOutForRetry = this.timeOutForRetry - 1;
      if (this.timeOutForRetry === 0) {
        this.waitingForDeviceConnected = false;
        clearInterval(controller);
      }
    }, 1000);
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  retryInjection() {
    this._store.dispatch(
      new fromSharedStore.BackdropSetConfig({
        component: null,
      })
    );
    this._store.dispatch(new fromSharedStore.BackdropHide());
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-transparent')
    );
    this._store.dispatch(
      new fromSharedStore.SliderPageSetHeaderOptions({
        color: '--color-transparent',
      })
    );
    this._store.dispatch(new fromSharedStore.SliderPageSlidePrev());
  }
}
