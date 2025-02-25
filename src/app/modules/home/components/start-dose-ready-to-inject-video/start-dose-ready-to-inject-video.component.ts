import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Store } from '@ngrx/store';
import { CapacitorVideoPlayer } from 'capacitor-video-player';
import { capVideoPlayerOptions } from 'capacitor-video-player/dist/esm/definitions';
import moment from 'moment';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as fromCoreStore from '@core/store';
import { IonIcon } from '@ionic/angular/standalone';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-dose-ready-to-inject-video',
  templateUrl: 'start-dose-ready-to-inject-video.component.html',
  styleUrls: ['start-dose-ready-to-inject-video.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonIcon],
})
export class StartDoseReadyToInjectVideoComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('videoWrapper') videoWrapper!: ElementRef;
  @ViewChild('videoTag') videoTag!: ElementRef;
  isDefaultVideoComponentFailed: boolean = false;
  private videoPlayer: any;
  readonly videoUrl: string = '/assets/videos/first-dose-video.mp4';
  private handlerPlay: any;
  private handlerPause: any;
  private handlerEnded: any;
  private handlerExit: any;
  private handlerReady: any;

  constructor(private _store: Store<fromCoreStore.CoreState>) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.playVideo();
  }

  private async playVideo() {
    this.isDefaultVideoComponentFailed = false;
    const videoElement = this.videoTag.nativeElement;
    if (Capacitor.getPlatform() === 'web') {
      videoElement.muted = true;
    }

    videoElement.ontimeupdate = () => {
      if (!videoElement.paused) {
        this.setTimeline();
      }
    };

    videoElement.play();
    this.initVideoPlayerOnMainVideoComponentStuck();
  }

  setTimeline() {
    const videoElement = this.videoTag.nativeElement;
    const totalLength = videoElement.duration % 60;
    const percentageCompleted = Math.round(
      (videoElement.currentTime / totalLength) * 100
    );
    const duration = moment
      .duration(Math.floor(videoElement.duration), 's')
      .asSeconds();
    const progress = moment
      .duration(Math.floor(videoElement.currentTime), 's')
      .asSeconds();
    const currentTime = Math.floor(videoElement.currentTime);
    const remainingTime = duration - progress;
    const timeline = {
      progress: `00:${currentTime < 10 ? '0' + currentTime : currentTime}`,
      duration: `00:${
        remainingTime < 10 ? '0' + remainingTime : remainingTime
      }`,
      percentage: percentageCompleted,
    };

    this._store.dispatch(
      new fromSharedStore.SliderPageSetContentOptions({
        timeline: timeline,
      })
    );
  }

  private initVideoPlayerOnMainVideoComponentStuck() {
    const videoIsInitTimeout = 3000;
    setTimeout(() => {
      const videoElement = this.videoTag.nativeElement;
      if (videoElement.currentTime === 0 && !this.videoPlayer) {
        this.startBackupVideoPlayer();
      }
    }, videoIsInitTimeout);
  }

  private async startBackupVideoPlayer() {
    this.isDefaultVideoComponentFailed = true;
    this.videoPlayer = CapacitorVideoPlayer;

    const videoSettings: capVideoPlayerOptions = {};
    this.addListenersToPlayerPlugin();
    if (this.videoUrl) {
      videoSettings.mode = 'fullscreen';
      videoSettings.url =
        Capacitor.getPlatform() === 'web'
          ? this.videoUrl
          : `public${this.videoUrl}`;
      videoSettings.showControls = true;
      videoSettings.displayMode = 'portrait';
      videoSettings.playerId = 'fullscreen';
      videoSettings.componentTag = 'automagic-start-dose-ready-to-inject-video';

      const res: any = await this.videoPlayer.initPlayer(videoSettings);
      this.videoPlayer.play();
    }
  }

  restartTrainingVideo() {
    this.startBackupVideoPlayer();
  }

  videoError(event: ErrorEvent) {
    console.log('[StartDoseReadyToInjectVideoComponent] Video error', event);
    this.startBackupVideoPlayer();
  }

  private async cleanUpVideoPlayer() {
    await this.handlerPlay.remove();
    await this.handlerPause.remove();
    await this.handlerEnded.remove();
    await this.handlerReady.remove();
    await this.handlerExit.remove();
    await this.videoPlayer.stopAllPlayers();
    this.videoPlayer = undefined;
  }

  private async addListenersToPlayerPlugin(): Promise<void> {
    this.handlerPlay = await this.videoPlayer.addListener(
      'jeepCapVideoPlayerPlay',
      (data: any) => {
        const fromPlayerId = data.fromPlayerId;
        const currentTime = data.currentTime;
        console.log(
          `<<<< onPlay in ViewerVideo ${fromPlayerId} ct: ${currentTime}`
        );
      },
      false
    );
    this.handlerPause = await this.videoPlayer.addListener(
      'jeepCapVideoPlayerPause',
      (data: any) => {
        const fromPlayerId = data.fromPlayerId;
        const currentTime = data.currentTime;
        console.log(
          `<<<< onPause in ViewerVideo ${fromPlayerId} ct: ${currentTime}`
        );
      },
      false
    );
    this.handlerEnded = await this.videoPlayer.addListener(
      'jeepCapVideoPlayerEnded',
      (data: any) => {
        const fromPlayerId = data.fromPlayerId;
        const currentTime = data.currentTime;
        console.log(
          `<<<< onEnded in ViewerVideo ${fromPlayerId} ct: ${currentTime}`
        );
      },
      false
    );
    this.handlerExit = await this.videoPlayer.addListener(
      'jeepCapVideoPlayerExit',
      (data: any) => {
        const dismiss = data.dismiss;
        console.log(`<<<< onExit in ViewerVideo ${dismiss}`);
        this.cleanUpVideoPlayer();
      },
      false
    );
    this.handlerReady = await this.videoPlayer.addListener(
      'jeepCapVideoPlayerReady',
      (data: any) => {
        const fromPlayerId = data.fromPlayerId;
        const currentTime = data.currentTime;
        console.log(
          `<<<< onReady in ViewerVideo ${fromPlayerId} ct: ${currentTime}`
        );
      },
      false
    );
    return;
  }

  async ngOnDestroy(): Promise<void> {
    await this.cleanUpVideoPlayer();
  }
}
