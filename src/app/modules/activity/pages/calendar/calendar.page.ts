import { Component } from '@angular/core';

@Component({
  selector: 'automagic-calendar',
  templateUrl: 'calendar.page.html',
  styleUrls: ['calendar.page.scss'],
})
export class CalendarPage {
  public slides: any[];

  constructor() {
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
