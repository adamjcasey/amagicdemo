import {
  Component,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit
} from '@angular/core';
import { IonModal } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'automagic-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatepickerComponent implements OnInit {
  @Input() labelInput?: string;
  @Input() labelPlaceholder?: string;
  @Input() continuous?: boolean = false;
  @Input() monthsPerView?: any = 'auto';
  @Input() multiple?: boolean = false;
  @Input() disabled?: boolean = false;
  @Input() selectedDates: Date[] = [];
  @Input() value?: any;
  @Output() dateSelected = new EventEmitter<Date[]>();
  @ViewChild('datePickerInput') datePickerInput!: ElementRef;
  @ViewChild('datePickerList') datePickerList!: ElementRef;
  @ViewChild('modal') modal!: IonModal;
  public months: any[] = []; // Array to hold the months data
  public weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; // Array to hold the weekdays data
  public isFirstMonth: boolean = true;
  public isLastMonth: boolean = false;
  public idDatePicker?: number;
  public monthsToGenerate: number = 2;

  constructor() {}

  ngOnInit(): void {
    this.months = this.generateMonths();
    this.idDatePicker = Math.floor(Math.random() * 100);
  }

  generateMonths(): any[] {
    if (this.selectedDates.length) {
      const lastDate = this.selectedDates[this.selectedDates.length - 1];
      const lastMonthToGenerate = lastDate.getMonth();
      const currentMonth = new Date().getMonth();
        if (currentMonth <= lastMonthToGenerate) {
            this.monthsToGenerate = lastMonthToGenerate - currentMonth + 1;
        } else {
            this.monthsToGenerate = 12 - currentMonth + lastMonthToGenerate + 1;
        }
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const months: any[] = [];
    let date = new Date(currentYear, currentMonth);

    for (let i = 0; i < this.monthsToGenerate; i++) {
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
    const today = new Date(moment().format('YYYY/MM/DD')); // Get today's date
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const numDays = lastDayOfMonth.getDate();

    let week: any[] = [];
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      week.push('');
    }

    for (let day = 1; day <= numDays; day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      // Check if the current date is today's date
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = this.selectedDates?.filter((date: any) => {
        return moment(date).isSame(currentDate, 'year') &&
          moment(date).isSame(currentDate, 'month') &&
          moment(date).isSame(currentDate, 'day');
      }).length;

      week.push({
        number: day,
        isToday: isToday,
        isSelected: isSelected,
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
    if (!this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const selectedDates = [...this.selectedDates];
      const dateSelected = new Date(`${month} ${day} ${year}`);
      if (event.target.classList.contains('is-selected')) {
        if (this.multiple) {
          const index = selectedDates.findIndex((date) => date.getTime() === dateSelected.getTime());
          if (index > -1) {
            selectedDates.splice(index, 1);
          }
        }

        if (event.target.tagName === 'SPAN') {
          event.target.parentElement.classList.remove('is-selected');
        }
        else {
          event.target.classList.remove('is-selected');
        }
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

        if (event.target.tagName === 'SPAN') {
          event.target.parentElement.classList.add('is-selected');
        }
        else {
          event.target.classList.add('is-selected');
        }
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

  prevMonth() {
    const currentMonth = this.datePickerList.nativeElement.querySelector('table.month.is-active');
    currentMonth.classList.remove('is-active');
    const prevMonth = currentMonth.previousElementSibling;
    prevMonth.classList.add('is-active');
    if (!prevMonth.previousElementSibling) {
      this.isFirstMonth = true;
      this.isLastMonth = false;
    }
  }

  nextMonth() {
    if (this.isFirstMonth) {
      this.isFirstMonth = false;
    }

    const currentMonth = this.datePickerList.nativeElement.querySelector('table.month.is-active');
    currentMonth.classList.remove('is-active');
    const nextMonth = currentMonth.nextElementSibling;
      if (nextMonth) {
          this.isLastMonth = true;
          nextMonth.classList.add('is-active');
      }
  }

  toggleDatepickerModal() {
    this.modal.isOpen = !this.modal.isOpen;
    this.modal.showBackdrop = this.modal.isOpen;
  }

  formatValue(date: Date) {
    return moment(date).format('MMM D, YYYY');
  }

  setValuePickerInModal(value: any) {
    this.value = this.formatValue(new Date(value));
  }
}
