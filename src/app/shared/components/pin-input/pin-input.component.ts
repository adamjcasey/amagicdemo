import { 
  Component, 
  Output, 
  EventEmitter, 
  ViewEncapsulation, 
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';

@Component({
  selector: 'automagic-pin-input',
  templateUrl: 'pin-input.component.html',
  styleUrls: ['pin-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PinInputComponent implements AfterViewInit {
  @Output() onChange = new EventEmitter<string>();
  @Output() onError = new EventEmitter<boolean>();
  @Input() error!: any;
  @Input() allowedCodes!: string[];
  @ViewChild('digit1') digit1!: ElementRef;
  @ViewChild('digit2') digit2!: ElementRef;
  @ViewChild('digit3') digit3!: ElementRef;
  @ViewChild('digit4') digit4!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    const digit1 = document.getElementById('digit-1');
    // digit1?.focus();
  }

  limitToOneDigit(event: any) {
    const input = event.target.value;
    // Remove any characters after the first digit
    event.target.value = input.charAt(0);
  }

  onDigit(event: any) {
    const currentDigit = event.target;
    const previousDigit = currentDigit.previousSibling;
    const nextDigit = currentDigit.nextSibling;
    if (event.code === 'Backspace') {
      debugger
      if (previousDigit) {
        previousDigit?.removeAttribute('disabled');
        previousDigit?.focus();
      }
    }
    else {
      if (currentDigit.value !== '') {
        nextDigit?.removeAttribute('disabled');
        nextDigit?.focus();
      }
    }

    const output = `${this.digit1?.nativeElement.value}${this.digit2?.nativeElement.value}${this.digit3?.nativeElement.value}${this.digit4?.nativeElement.value}`;
    if (this.allowedCodes) {
      if (output.length === 4) {
        if (!this.allowedCodes.includes(output)) {
          this.error = 'Invalid digital code';
          this.onError.emit(true);
        }
        else {
          this.error = null;
          this.onError.emit(false);
        }
      }
      else {
        this.error = null;
        this.onError.emit(false);
      }
    }

    this.onChange.emit(output);
  }

}
