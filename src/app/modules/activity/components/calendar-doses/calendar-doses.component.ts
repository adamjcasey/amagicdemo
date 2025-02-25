import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatepickerComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import {
  IonButton,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';

@Component({
  selector: 'automagic-calendar-doses',
  templateUrl: 'calendar-doses.component.html',
  styleUrls: ['calendar-doses.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatepickerComponent,
    IonButton,
    IonDatetimeButton,
    IonDatetime,
    IonModal,
  ],
})
export class CalendarDosesComponent implements OnInit, OnDestroy {
  public welcomeConfig$!: Observable<any>;
  public welcomeConfig: any;
  public selectedDates: Date[] = [];
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.welcomeConfig$ = this._store.select(fromWelcomeStore.getWelcomeConfig);
  }

  ngOnInit() {
    this.welcomeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((welcomeConfig) => {
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

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  onEditSchedule() {
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-white')
    );
    this._store.dispatch(new fromSharedStore.BottomToolbarHide());
    this._store.dispatch(
      new fromSharedStore.SliderPageSetContentOptions({
        hide: false,
        isExpanded: true,
        component: 'calendar-edit-schedule',
        toolbar: {
          actions: [
            {
              label: 'Cancel',
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-purple'
                  )
                );
                this._store.dispatch(new fromSharedStore.BottomToolbarShow());
                this._store.dispatch(
                  new fromSharedStore.SliderPageSetContentOptions({
                    hide: true,
                    isExpanded: false,
                    actions: null,
                  })
                );
              },
            },
            {
              label: 'Save',
              action: () => {
                this._store.dispatch(
                  new fromSharedStore.TopbarChangeColor(
                    '--color-bg-pastel-purple'
                  )
                );
                this._store.dispatch(new fromSharedStore.BottomToolbarShow());
                this._store.dispatch(
                  new fromSharedStore.SliderPageSetContentOptions({
                    hide: true,
                    isExpanded: false,
                    actions: null,
                  })
                );
              },
            },
          ],
        },
      })
    );
  }
}
