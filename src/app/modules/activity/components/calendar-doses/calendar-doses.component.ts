import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import * as fromWelcomeStore from '@welcome/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-calendar-doses',
  templateUrl: 'calendar-doses.component.html',
  styleUrls: ['calendar-doses.component.scss'],
})
export class CalendarDosesComponent implements OnInit {
  public welcomeConfig$!: Observable<any>;
  public welcomeConfig: any;
  public selectedDates: Date[] = [];
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.welcomeConfig$ = this._store.select(fromWelcomeStore.getWelcomeConfig);
  }

  ngOnInit() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple'));
    this.welcomeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(welcomeConfig => {
        if (welcomeConfig) {
          this.welcomeConfig = welcomeConfig;
          if (this.welcomeConfig.doses) {
            this.welcomeConfig.doses.forEach((dose: any) => {
              this.selectedDates.push(new Date(dose));
            });
          }
        }
      });
  }

  onEditSchedule() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-white'));
    this._store.dispatch(new fromSharedStore.BottomToolbarHide(true));
    this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
      hide: false,
      isExpanded: true,
      component: 'calendar-edit-schedule',
      toolbar: {
        actions: [
          {
            label: 'Cancel',
            action: () => {
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple'));
              this._store.dispatch(new fromSharedStore.BottomToolbarHide(false));
              this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
                hide: true,
                isExpanded: false,
                actions: null,
              }));
            }
          },
          {
            label: 'Save',
            action: () => {
              this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-purple'));
              this._store.dispatch(new fromSharedStore.BottomToolbarHide(false));
              this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
                hide: true,
                isExpanded: false,
                actions: null,
              }));
            }
          }
        ]
      }
    }));
  }
}
