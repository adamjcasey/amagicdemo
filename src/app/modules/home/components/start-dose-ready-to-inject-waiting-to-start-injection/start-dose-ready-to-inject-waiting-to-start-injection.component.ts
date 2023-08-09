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

  constructor() {

  }

  ngOnInit() {
    console.log('StartDoseReadyToInjectWaitingToStartInjectionComponent ngOnInit');
  }

  ngAfterViewInit() {
    console.log('StartDoseReadyToInjectWaitingToStartInjectionComponent ngAfterViewInit');
    this.playVideo();
  }

  async playVideo() {
    console.log('playVideo');
    const videoElement = this.videoTag.nativeElement;
    if (videoElement) {
      console.log('videoElement ', videoElement);
      if (Capacitor.getPlatform() === 'web') {
        videoElement.muted = true;
      }

      videoElement.play();
    }
    else {
      console.log('no esta el element');
    }
  }
}
