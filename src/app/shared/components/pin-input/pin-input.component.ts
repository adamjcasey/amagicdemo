import { 
  Component, 
  Output, 
  EventEmitter, 
  ViewEncapsulation, 
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { animate, spring } from 'motion';

@Component({
  selector: 'automagic-pin-input',
  templateUrl: 'pin-input.component.html',
  styleUrls: ['pin-input.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PinInputComponent {
  @Output() onChange = new EventEmitter<any>();
  @Output() onError = new EventEmitter<boolean>();
  @Input() error!: any;
  @Input() allowedCodes!: string[];
  @ViewChild('digit1') digit1!: ElementRef;
  @ViewChild('digit2') digit2!: ElementRef;
  @ViewChild('digit3') digit3!: ElementRef;
  @ViewChild('digit4') digit4!: ElementRef;
  public value!: string;

  constructor() {
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener('keyboardWillShow', info => {
        const inputPosition = this.digit1.nativeElement.getBoundingClientRect();
        const positionY = inputPosition.top + inputPosition.height;
        const remainingScreenSpace = window.innerHeight - info.keyboardHeight;
        if (positionY > remainingScreenSpace) {
          animate(
            `#backdrop`,
            { 
              y: `-${(positionY - remainingScreenSpace) + 30}px`,
              height: `${window.innerHeight + ((positionY - remainingScreenSpace) + 30)}px`,
            },
            { easing: spring({
              stiffness: 80,
              damping: 20,
              mass: 1,
              velocity: 800,
            }) }
          );
        }
      });
  
      Keyboard.addListener('keyboardWillHide', () => {
        animate(
          `#backdrop`,
          { 
            y: `0px`,
            height: `${window.innerHeight}px`,
          },
          { easing: spring({
            stiffness: 80,
            damping: 20,
            mass: 1,
            velocity: 800,
          }) }
        );
      });
    }
  }

  onInput(event: any) {
    const input = event.target;
    const value = input.value;

    // Remove any characters after the first digit
    event.target.value = value.charAt(0);

    // if the input already has a previous value, set the
    // new value in the next digit input
    const nextDigit = input.nextSibling;
    if (nextDigit && value.length > 1) {
      nextDigit.value = value.charAt(1);
    }
  }

  onDigitEnter(event: any) {
    const currentDigit = event.target;
    const previousDigit = currentDigit.previousSibling;
    const nextDigit = currentDigit.nextSibling;

    if (event.code === 'Backspace') {
      if (previousDigit) {
        // if (previousDigit.value === '') {
          previousDigit?.removeAttribute('disabled');
          previousDigit?.focus();
        // }
      }
    }
    else if (event.code === 'Enter') {
      console.log('hace enter');
      const nextDigit = currentDigit.nextSibling;
      if (nextDigit) {
        nextDigit.focus();
      }
      else {
        this.validateValue(true);
      }
    }
    else {
      if (currentDigit.value !== '') {
        nextDigit?.removeAttribute('disabled');
        nextDigit?.focus();
      }
    }

    this.value = `${this.digit1?.nativeElement.value}${this.digit2?.nativeElement.value}${this.digit3?.nativeElement.value}${this.digit4?.nativeElement.value}`;
    this.validateValue();
  }

  validateValue(submit?: boolean) {
    if (this.allowedCodes) {
      if (this.value.length === 4) {
        if (!this.allowedCodes.includes(this.value)) {
          this.error = 'Invalid digital code';
          this.onError.emit(true);
        }
        else {
          this.error = null;
          this.onError.emit(false);
          this.onChange.emit({
            value: this.value,
            submit: submit,
          });
        }
      }
      else {
        this.error = null;
        this.onError.emit(false);
      }
    }
  }
}
