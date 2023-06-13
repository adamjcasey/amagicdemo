import { 
  Component, 
  Output, 
  EventEmitter, 
  ViewEncapsulation, 
  AfterViewInit
} from '@angular/core';

@Component({
  selector: 'automagic-pin-input',
  templateUrl: 'pin-input.component.html',
  styleUrls: ['pin-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PinInputComponent implements AfterViewInit {
  @Output() pinChange = new EventEmitter<number>();

  constructor() {}

  ngAfterViewInit(): void {
    const digit1 = document.getElementById('digit-1');
    digit1?.focus();
  }

  limitToOneDigit(event: any) {
    const input = event.target.value;
    // Remove any characters after the first digit
    event.target.value = input.charAt(0);
  }

  onDigit(event: any, digit: number) {
    const currentDigit = document.getElementById(`digit-${digit}`);
    const previousDigit = digit > 1 ? document.getElementById(`digit-${digit - 1}`) : null;
    const nextDigit = digit < 4 ? document.getElementById(`digit-${digit + 1}`) : null;
    if (event.code === 'Backspace') {
      if (digit > 1) {
        currentDigit?.setAttribute('disabled', 'true');
        previousDigit?.focus();
      }
    }
    else {
      if (event.target.value !== '') {
        nextDigit?.removeAttribute('disabled');
        nextDigit?.focus();
      }
    }

    const digit1 = (document.getElementById('digit-1') as HTMLInputElement)
    const digit2 = (document.getElementById('digit-2') as HTMLInputElement);
    const digit3 = (document.getElementById('digit-3') as HTMLInputElement);
    const digit4 = (document.getElementById('digit-4') as HTMLInputElement);
    this.pinChange.emit(Number(`${digit1?.value}${digit2?.value}${digit3?.value}${digit4?.value}`));
  }

}
