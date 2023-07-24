import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-calendar',
  templateUrl: 'calendar.page.html',
  styleUrls: ['calendar.page.scss'],
})
export class CalendarPage {
  public slides: any[];

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.slides = [
      {
        header: {
          color: '--color-bg-pastel-purple',
          component: 'calendar-doses',
        },
        content: {
          hide: true,
        },
      },
    ];
  }
}
