import { 
  Component, 
  ViewEncapsulation,
  Input,
  Output, 
  EventEmitter, 
} from '@angular/core';

@Component({
  selector: 'automagic-datepicker-continuous',
  templateUrl: 'datepicker-continuous.component.html',
  styleUrls: ['datepicker-continuous.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatepickerContinuousComponent {
  @Input() limitSize?: boolean = false;
  @Output() dateSelected = new EventEmitter<Date[]>();
  public months: any[]; // Array to hold the months data
  public weekdays: string[]; // Array to hold the weekdays data
  public selectedDates: Date[] = [];

  constructor() {
    this.months = this.generateMonths();
    this.weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  generateMonths(): any[] {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const months: any[] = [];
    let date = new Date(currentYear, currentMonth);

    for (let i = 0; i < 12; i++) {
      const monthName = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const weeks = this.generateWeeks(date);
      
      months.push({ name: monthName, year, weeks });

      date.setMonth(date.getMonth() + 1);
    }

    return months;
  }

  generateWeeks(date: Date): any[] {
    const weeks: any[] = [];
    const today = new Date(); // Get today's date
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const numDays = lastDayOfMonth.getDate();

    let week: any[] = [];
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      week.push('');
    }

    for (let day = 1; day <= numDays; day++) {
      // week.push(day);
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);

      // Check if the current date is today's date
      const isToday = currentDate.toDateString() === today.toDateString();
      week.push({ 
        number: day,
        isToday: isToday 
      });

      if (week.length === 7) {
        weeks.push({ days: week });
        week = [];
      }
    }

    if (week.length > 0) {
      weeks.push({ days: week });
    }

    return weeks;
  }

  selectDate(event: any, month: string, day: number, year: number) {
    const dateSelected = new Date(`${month} ${day} ${year}`);
    const selectedDates = [...this.selectedDates];
    const index = selectedDates.findIndex((date) => date.getTime() === dateSelected.getTime());
    if (event.target.classList.contains('is-selected')) {
      event.target.classList.remove('is-selected');
      if (index > -1) {
        selectedDates.splice(index, 1);
      }
    }
    else {
      event.target.classList.add('is-selected');
      selectedDates.push(dateSelected);
    }

    this.selectedDates = selectedDates;
    this.dateSelected.emit(this.selectedDates);
  }

}
