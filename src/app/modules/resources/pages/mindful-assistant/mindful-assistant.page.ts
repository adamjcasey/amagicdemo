import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-mindful-assistant',
  templateUrl: './mindful-assistant.page.html',
  styleUrls: ['./mindful-assistant.page.scss'],
})
export class MindfulAssistantPage implements OnInit {
  public heroConfig: any;
  public cards: Array<any> = [];
  public exit_card: any;

  constructor(private _store: Store<fromCoreStore.CoreState>) { 
  }

  ngOnInit() {
    this.heroConfig = {
      color: 'var(--color-bg-pastel-lime)',
      template: `
        <h1 class="font-heading-1--bold">Mindful Assistant</h1>
       `,
       actions: [],
    };

    this.cards = [
      {
        type: 'mindful',
        title: 'Stress reduction Exercises',
        asset: '/assets/images/resources-mindful-assistant-stress.svg',
        action: () => {
          console.log('Mindful Assistant: Stress Reduction');
        }
      },
      {
        type: 'mindful',
        title: 'Delay Injection 30 min',
        asset: '/assets/images/resources-mindful-assistant-delay.svg',
        action: () => {
          console.log('Mindful Assistant: Delay Injection');
        }
      },      
      {
        type: 'mindful',
        title: 'Pain reduction Techniques',
        asset: '/assets/images/resources-mindful-assistant-pain.svg',
        action: () => {
          console.log('Mindful Assistant: Pain Reduction');
        }
      }, 
      {
        type: 'mindful',
        title: 'Talk to a coach',
        asset: '/assets/images/resources-mindful-assistant-talk.svg',
        action: () => {
          console.log('Mindful Assistant: Talk to a coach');
        }
      },      
    ];    
    this.exit_card = {
      asset: '/assets/images/resources-mindful-assistant-dot.svg',
      description: 'Stress less, sleep soundly, and get happier.  Use Headspace.',
      link: {
        label: 'Let’s start',
        color: "salmon",
        action: () => {
          this.goTo('/resources/headspace');
        }
      },
    }
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
