import { Component } from '@angular/core';
import { Router, Event as RoutingEvent, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { animate, spring  } from 'motion';

import * as fromCoreStore from '@core/store';

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

  constructor(
    private _router: Router,
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    // list of excluded pages to shown bottom toolbar component
    this.excludedPaths = [
      '/welcome',
      '/home/start-dose/prepare',
      '/home/start-dose/ready-to-inject',
      '/home/start-dose/inject-done',
      '/symptoms/add',
      '/settings/setup-reminders',
      'resources/your-care-team/detail',
    ];

    this.routerEvents$ = this._router.events.subscribe(
      (event: RoutingEvent) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
        }
      },
    );
  }

  ngOnDestroy() {
    this.routerEvents$.unsubscribe();
  }

  isActivePath(path: string) {
    return this.currentRoute.includes(path);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const element = document.getElementById('bottom-toolbar');
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
      ).finished.then(() => {
        element?.classList.add('is-open');
      });
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
      ).finished.then(() => {
        element?.classList.remove('is-open');
      });;
    }
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));

    if (this.isOpen) {
      this.toggle();
    }
  }
}
