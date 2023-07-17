import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-video-detail',
  templateUrl: 'start-dose-ready-to-inject-video-detail.component.html',
  styleUrls: ['start-dose-ready-to-inject-video-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectVideoDetailComponent implements OnInit, AfterViewInit {
  public videoPlayer: any;
  @ViewChild('videoDetailWrapper') videoWrapper!: ElementRef;
  @ViewChild('videoDetailTag') videoTag!: ElementRef;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.playVideo();
  }

  async playVideo() {
    const videoElement = this.videoTag.nativeElement;
    if (Capacitor.getPlatform() === 'web') {
      videoElement.muted = true;
    }

    videoElement.ontimeupdate = () => {
      const totalLength = videoElement.duration % 60;   
      const percentageCompleted = Math.round((videoElement.currentTime / totalLength) * 100);
      const duration = moment.duration(Math.floor(videoElement.duration), 's').asSeconds();
      const progress = moment.duration(Math.floor(videoElement.currentTime), 's').asSeconds();
      const currentTime = Math.floor(videoElement.currentTime);
      const timeline = {
        progress: `00:${currentTime < 10 ? '0' + currentTime : currentTime}`,
        duration: `00:${duration - progress}`,
        percentage: percentageCompleted,
      }

      this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
        timeline: timeline,
      }));
    }; 

    videoElement.onpause = () => {
      this._store.dispatch(new fromSharedStore.SliderPageSetContentOptions({
        timeline: null,
      }));
    }; 

    videoElement.play(); 
  }
}
