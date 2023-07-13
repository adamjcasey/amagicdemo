import { 
  Component, 
  Output, 
  EventEmitter, 
  ViewEncapsulation, 
  Input
} from '@angular/core';

@Component({
  selector: 'automagic-rating-field',
  templateUrl: 'rating-field.component.html',
  styleUrls: ['rating-field.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RatingFieldComponent {
  @Output() onChage = new EventEmitter<number>();
  @Input() label!: string;
  @Input() value: number = 1;
  @Input() name!: string;
  @Input() rates!: string[];
  @Input() showIcons!: boolean;
  @Input() error!: any;

  constructor() {}

  updateValue(value: number) {
    this.value = value;
    this.onChage.emit(this.value);
  }

}
