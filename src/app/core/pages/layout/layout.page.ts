import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'automagic-layout',
  templateUrl: 'layout.page.html',
  styleUrls: ['layout.page.scss'],
})
export class LayoutPage implements OnInit {
  public inWelcome: boolean = true;

  constructor(private _router: Router) {}

  ngOnInit() {
    this._router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/welcome') {
          const videoIntro = document.querySelector('.welcome-page__video-intro');
          if (videoIntro instanceof HTMLVideoElement) {
            const observer = setInterval(() => {
              if (videoIntro.ended) {
                this.inWelcome = false;
                clearInterval(observer);
              }
            }, 200);
          }
        }
        else {
          this.inWelcome = false;
        }
      }
    });
  }
}
