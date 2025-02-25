import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatepickerComponent } from '@app/shared/components';
import { ReversePipe } from '@app/shared/pipes';
import * as fromCoreStore from '@core/store';
import * as fromStore from '@home/store';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'automagic-calendar-edit-schedule',
  templateUrl: 'calendar-edit-schedule.component.html',
  styleUrls: ['calendar-edit-schedule.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatepickerComponent,
    IonIcon,
    IonButton,
    ReversePipe,
  ],
})
export class CalendarEditScheduleComponent implements OnInit, OnDestroy {
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);

    addIcons({ addCircleOutline });
  }

  ngOnInit() {
    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }
}
