import { 
  Component,
  Output,
  EventEmitter,
  ViewEncapsulation 
} from '@angular/core';

@Component({
  selector: 'automagic-welcome-doses-selector',
  templateUrl: 'welcome-doses-selector.component.html',
  styleUrls: ['welcome-doses-selector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomeDosesSelectorComponent {
  @Output() onDosesChange = new EventEmitter<Date[]>();

  constructor() {}

  getDosesDates(doses: Array<Date>) {
    this.onDosesChange.emit(doses);
  }
}
