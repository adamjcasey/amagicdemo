import { 
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation, 
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'automagic-start-dose-ready-to-inject-waiting-to-start-injection',
  templateUrl: 'start-dose-ready-to-inject-waiting-to-start-injection.component.html',
  styleUrls: ['start-dose-ready-to-inject-waiting-to-start-injection.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDoseReadyToInjectWaitingToStartInjectionComponent implements OnInit, AfterViewInit {
  @ViewChild('videoTag') videoTag!: ElementRef;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.playVideo();
  }

  async playVideo() {
    const videoElement = this.videoTag.nativeElement;
    if (videoElement) {
      if (Capacitor.getPlatform() === 'web') {
        videoElement.muted = true;
      }

      videoElement.play();
    }
  }
}
