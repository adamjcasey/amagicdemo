import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorVideoPlayer } from 'capacitor-video-player';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-video-detail',
  templateUrl: 'start-dose-ready-to-inject-video-detail.component.html',
  styleUrls: ['start-dose-ready-to-inject-video-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectVideoDetailComponent implements OnInit, AfterViewInit {
  public videoPlayer: any;
  @ViewChild('videoWrapper') videoWrapper!: ElementRef;
  @ViewChild('videoTag') videoTag!: ElementRef;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.playVideo();
  }

  async playVideo() {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      this.videoPlayer = CapacitorVideoPlayer;
      await this.videoPlayer.initPlayer({ 
        mode: 'portrait', 
        url: 'public/assets/videos/first-dose-video.mp4', 
        showControls: false, 
        playerId: 'first-dose-video', 
        bkmodeEnabled: false,
      });
    }
    else {
      const videoElement = this.videoTag.nativeElement;
      videoElement.muted = true;
      videoElement.play();
      videoElement.onended = () => {}
    }
  }
}
