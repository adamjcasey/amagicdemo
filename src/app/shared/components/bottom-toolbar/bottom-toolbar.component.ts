import { Component } from '@angular/core';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';

@Component({
  selector: 'said-bottom-toolbar',
  templateUrl: 'bottom-toolbar.component.html',
  styleUrls: ['bottom-toolbar.component.scss'],
})
export class BottomToolbarComponent {
  public routerEvents$;
  public currentRoute: string = '';
  public excludedPaths: Array<string>;

  constructor(private _router: Router) {
    this.excludedPaths = [];
    this.routerEvents$ = this._router.events.subscribe(
      (event: NavigationEvent) => {
        if(event instanceof NavigationEnd) {
          this.currentRoute = event.url;
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
}
