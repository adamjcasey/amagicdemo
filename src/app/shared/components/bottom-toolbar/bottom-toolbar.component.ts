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
      )
    }
    else {
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
    }
  }
}
