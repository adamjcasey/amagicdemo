import { 
  Component,
  ViewEncapsulation,
  ViewChild,
  ElementRef, 
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Store } from '@ngrx/store';

import * as fromSharedStore from '@shared/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-time-traveling',
  templateUrl: 'time-traveling.component.html',
  styleUrls: ['time-traveling.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeTravelingComponent {
  public isPlayingVideo: boolean = false;
  public endedVideo: boolean = false;
  @ViewChild('videoTraining') videoTraining!: ElementRef;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {}

  playVideo () {
    // setup and playing the video
    const videoElement = this.videoTraining.nativeElement;
    videoElement.onended = () => {
      this.endedVideo = true;
    }

    if (Capacitor.getPlatform() === 'web') {
      videoElement.muted = true;
    }

    this.isPlayingVideo = true;
    setTimeout(() => {
      videoElement.play();
    }, 1000);
  }

  closeBackdrop() {
    this._store.dispatch(new fromSharedStore.BackdropHide);
  }
}
