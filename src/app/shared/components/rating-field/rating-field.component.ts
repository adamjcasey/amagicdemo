import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-rating-field',
  templateUrl: 'rating-field.component.html',
  styleUrls: ['rating-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonIcon],
})
export class RatingFieldComponent {
  @Output() onChage = new EventEmitter<number>();
  @Input() label!: string;
  @Input() value: number = 1;
  @Input() name!: string;
  @Input() rates!: string[];
  @Input() showIcons!: boolean;
  @Input() disabled: boolean = false;
  @Input() error!: any;

  constructor() {}

  updateValue(value: number) {
    this.value = value;
    this.onChage.emit(this.value);
  }
}
