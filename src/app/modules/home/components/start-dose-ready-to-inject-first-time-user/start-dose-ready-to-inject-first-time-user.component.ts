import {
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromCoreStore from '@core/store';
import { IonIcon } from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-first-time-user',
  templateUrl: 'start-dose-ready-to-inject-first-time-user.component.html',
  styleUrls: ['start-dose-ready-to-inject-first-time-user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonIcon],
})
export class StartDoseReadyToInjectFirstTimeUserComponent {
  @Output() onPlayTrainingVideo = new EventEmitter<Date[]>();

  constructor(private _store: Store<fromCoreStore.CoreState>) {}

  startTrainingVideo() {
    this._store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-transparent')
    );
    this.onPlayTrainingVideo.emit();
  }
}
