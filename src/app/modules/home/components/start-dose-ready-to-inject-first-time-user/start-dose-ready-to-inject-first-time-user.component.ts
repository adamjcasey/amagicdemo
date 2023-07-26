import { 
  Component,
  ViewEncapsulation, 
  Output,
  EventEmitter,
} from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-first-time-user',
  templateUrl: 'start-dose-ready-to-inject-first-time-user.component.html',
  styleUrls: ['start-dose-ready-to-inject-first-time-user.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectFirstTimeUserComponent {
  @Output() onPlayTrainingVideo = new EventEmitter<Date[]>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {}

  startTrainingVideo() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-transparent'));
    this.onPlayTrainingVideo.emit();
  }
}
