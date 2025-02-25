import { Component, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromCoreStore from '@core/store';
import { IonButton, IonImg } from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-time-traveling',
  templateUrl: 'time-traveling.component.html',
  styleUrls: ['time-traveling.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonImg],
})
export class TimeTravelingComponent {
  public isPlayingVideo: boolean = false;
  public endedVideo: boolean = false;
  public showingTimeTravel: boolean = false;

  constructor(private _store: Store<fromCoreStore.CoreState>) {}

  playVideo() {
    // setup and playing the video
    const timeTravelingAnimationDuration = 7000;
    const introAnimationDuration = 1000;

    setTimeout(() => {
      this.endedVideo = true;
      this.showingTimeTravel = false;
    }, timeTravelingAnimationDuration);

    this.isPlayingVideo = true;
    setTimeout(() => {
      this.showingTimeTravel = true;
    }, introAnimationDuration);
  }

  closeBackdrop() {
    this._store.dispatch(new fromSharedStore.BackdropHide());
  }
}
