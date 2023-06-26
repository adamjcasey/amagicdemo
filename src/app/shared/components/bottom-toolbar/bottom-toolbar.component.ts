import { Component } from '@angular/core';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { animate, spring  } from 'motion';

@Component({
  selector: 'automagic-bottom-toolbar',
  templateUrl: 'bottom-toolbar.component.html',
  styleUrls: ['bottom-toolbar.component.scss'],
})
export class BottomToolbarComponent {
  public routerEvents$;
  public currentRoute: string = '';
  public excludedPaths: Array<string>;
  public isOpen: boolean = false;

  constructor(private _router: Router) {
    this.excludedPaths = [
      '/welcome'
    ];

    this.routerEvents$ = this._router.events.subscribe(
      (event: NavigationEvent) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
        }
      }
    );
  }

  ngOnDestroy() {
    this.routerEvents$.unsubscribe();
  }

  isActivePath(path: string) {
    return this.currentRoute.includes(path);
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      animate(
        `#bottom-toolbar`,
        { height: '254px' },
        { easing: spring({
          stiffness: 80,
          damping: 20,
          mass: 1,
          velocity: 800,
        }) }
      );

      animate(
        `#bottom-toolbar .bottom-toolbar__content .cta`, 
        { 
          opacity: [ 0, 0.5, 0.8, 1 ],
          top: '0px',
        },
        { easing: 'ease-in-out', duration: 0.3, delay: 0.45 }
      );
    }
    else {
      animate(
        `#bottom-toolbar .bottom-toolbar__content .cta`, 
        { 
          opacity: [ 0.8, 0.5, 0 ],
          top: '25px',
        },
        { easing: 'ease-in-out', duration: 0.3 }
      ).finished.then(() => {
        animate(
          `#bottom-toolbar`,
          { height: '64px' },
          { easing: spring({
            stiffness: 80,
            damping: 20,
            mass: 1,
            velocity: 800,
          }) }
        )
      })
    }
  }
}
