import { AfterViewInit, Component } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  public heroConfig: any;
  public card: any;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.heroConfig = {
      color: 'var(--color-bg-pastel-green)',
      image: '/assets/images/homepage.svg',
      template: `
        <h1 class="font-heading-1--bold">Hi Marissa!</h1>
        <h5>Welcome to wellness on your schedule.</h5>
        <p>Ready to start your Theryx® injections?<br>Your first guided injection will take about <strong>10 minutes.</strong>
      `,
      actions: [
        {
          label: 'Start dose',
          action: () => {
            this.goTo('/home/start-dose/prepare');
          }
        }
      ]
    }

    this.card = {
      asset: '/assets/images/note.svg',
      title: 'Track your progress',
      description: 'Make a note of your symptoms to see Theryx® at work.',
      button: {
        label: 'Let’s start',
        action: () => {
          console.log('action home page card');
        }
      },
    }
  }

  ngAfterViewInit() {
    this._store.dispatch(new fromSharedStore.BackdropShow({
      transition: 'move',
      fullScreen: true,
      header: true,
      bgTemplate: 'top-hole',
      template: `
        <h1 class="font-heading-1--bold">Dose Day</h1>
        <p>For this demo, let's pretend that <br>you're scheduled for your first at-<br>home dose today</p>
      `,
    }));
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
