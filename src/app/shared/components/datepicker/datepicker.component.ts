import { 
  Component, 
  ViewEncapsulation,
  Input,
  Output, 
  EventEmitter,
  ViewChild, 
  ElementRef,
  AfterViewInit,
  OnInit
} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'automagic-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatepickerComponent implements OnInit {
  @Input() labelInput?: string = 'Label Datepicker';
  @Input() continuous?: boolean = false;
  @Input() multiple?: boolean = false;
  @Input() disabled?: boolean = false;
  @Input() selectedDates: Date[] = [];
  @Output() dateSelected = new EventEmitter<Date[]>();
  @ViewChild('datePickerInput') datePickerInput!: ElementRef;
  @ViewChild('datePickerList') datePickerList!: ElementRef;
  public months: any[] = []; // Array to hold the months data
  public weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];; // Array to hold the weekdays data

  constructor() {}

  ngOnInit(): void {
    this.months = this.generateMonths();
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
        isToday: isToday,
        isSelected: this.selectedDates?.filter(date => moment(date).isSame(currentDate)).length,
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

  openPicker() {
    const nativeElement = this.datePickerList.nativeElement;
    if (nativeElement.classList.contains('is-open')) {
      nativeElement.classList.remove('is-open')
    }
    else {
      nativeElement.classList.add('is-open')
    }
  }

  selectDate(event: any, month: string, day: number, year: number) {
    if (!this.disabled) {
      const selectedDates = [...this.selectedDates];
      const dateSelected = new Date(`${month} ${day} ${year}`);
      if (event.target.classList.contains('is-selected')) {
        if (this.multiple) {
          const index = selectedDates.findIndex((date) => date.getTime() === dateSelected.getTime());
          if (index > -1) {
            selectedDates.splice(index, 1);
          }
        }
        event.target.classList.remove('is-selected');
      }
      else {
        if (this.multiple) {
          selectedDates.push(dateSelected);
        }
        else {
          this.datePickerList.nativeElement.querySelectorAll('.month__week td').forEach((day: HTMLElement) => {
            if (day.classList.contains('is-selected')) {
              day.classList.remove('is-selected');
            }
          });
        }
        event.target.classList.add('is-selected');
      }

      if (this.multiple) {
        this.selectedDates = selectedDates;
        this.dateSelected.emit(this.selectedDates);
      }
      else {
        this.dateSelected.emit([dateSelected]);
        if (!this.continuous) {
          const inputNativeElement = this.datePickerInput.nativeElement;
          inputNativeElement.value = dateSelected;
        }
      }
    }
  }

}
