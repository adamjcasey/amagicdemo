import { 
  Component,
  Output,
  EventEmitter,
  ViewEncapsulation, 
  OnInit
} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'automagic-welcome-doses-selector',
  templateUrl: 'welcome-doses-selector.component.html',
  styleUrls: ['welcome-doses-selector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomeDosesSelectorComponent implements OnInit {
  public defaultDoses: Date[] = [];
  @Output() onDosesChange = new EventEmitter<Date[]>();

  constructor() {}

  ngOnInit(): void {
    this.defaultDoses.push(
      // weekly
      new Date(moment.now()),
      new Date(moment().add(1, 'week').calendar()),
      new Date(moment().add(2, 'week').calendar()),
      new Date(moment().add(3, 'week').calendar()),
      // bi-weekly
      new Date(moment().add(5, 'week').calendar()),
      new Date(moment().add(7, 'week').calendar()),
    );
    this.onDosesChange.emit(this.defaultDoses);
  }
}
