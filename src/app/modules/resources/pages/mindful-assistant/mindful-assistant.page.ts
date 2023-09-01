import { Component } from '@angular/core';

// Old version
// import { Store } from '@ngrx/store';
// import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-mindful-assistant',
  templateUrl: './mindful-assistant.page.html',
  styleUrls: ['./mindful-assistant.page.scss'],
})
export class MindfulAssistantPage {
  // Old version
  // public heroConfig: any;
  // public cards: Array<any> = [];
  // public exit_card: any;

  constructor(
    // Old version
    // private _store: Store<fromCoreStore.CoreState>
  ) {
    // Old version
    // this.heroConfig = {
    //   color: '--color-bg-pastel-lime',
    //   template: `
    //     <h1 class="font-heading-1--bold">Mindful Assistant</h1>
    //   `,
    // };

    // this.cards = [
    //   {
    //     type: 'mindful',
    //     title: 'Stress reduction Exercises',
    //     asset: '/assets/images/resources-mindful-assistant-stress.svg',
    //   },
    //   {
    //     type: 'mindful',
    //     title: 'Pain reduction Techniques',
    //     asset: '/assets/images/resources-mindful-assistant-pain.svg',
    //   }, 
    //   {
    //     type: 'mindful',
    //     title: 'Delay Injection 30 min',
    //     asset: '/assets/images/resources-mindful-assistant-delay.svg',
    //   },
    //   {
    //     type: 'mindful',
    //     title: 'Talk to a<br>coach',
    //     asset: '/assets/images/resources-mindful-assistant-talk.svg',
    //   }, 
    //   {
    //     asset: '/assets/images/resources-mindful-assistant-dot.svg',
    //     description: 'Stress less, sleep soundly, and get happier. Use Headspace.',
    //     link: {
    //       label: 'Let’s start',
    //       color: 'salmon',
    //       cssClasses: 'hotspot-element',
    //       action: () => {
    //         this.goTo('resources/mindful-assistant/start');
    //       }
    //     },
    //   }     
    // ];
  }

  // Old version
  // goTo(path: string) {
  //   this._store.dispatch(new fromCoreStore.Go({
  //     path: [path]
  //   }));
  // }
}
