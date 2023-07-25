import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-resources',
  templateUrl: 'resources.page.html',
  styleUrls: ['resources.page.scss'],
})
export class ResourcesPage {

  public cards_left: Array<any> = [];
  public cards_right: Array<any> = [];
  

  constructor(
      private _store: Store<fromCoreStore.CoreState>
    ) {
    this.cards_left = [
      {
        type: 'simple',
        title: 'Care Team',
        asset: '/assets/images/resources-entry-care-team.svg',
        description: 'Connect to your health care providers for holistic care.',
        action: () => {
          this.goTo('/resources/your-care-team');
        }
      },
      {
        type: 'simple',
        title: 'Education',
        asset: '/assets/images/resources-entry-education.svg',
        description: 'Stay up-to-date and learn more about your condition and treatment.',
        action: () => {
          this.goTo('/resources/education');
        }
      },      
      {
        type: 'simple',
        title: 'OnePath™',
        asset: '/assets/images/resources-entry-one-path.svg',
        description: 'Chat with your patient support manager (PSM).',
        action: () => {
          this.goTo('/resources/one-path');
        }
      },
    ];

    this.cards_right = [
      {
        type: 'simple',
        title: 'Community Feed',
        asset: '/assets/images/resources-entry-community-feed.svg',
        description: 'Connect to a larger community of fellow patients to learn tips and tricks.',
        action: () => {
          this.goTo('/resources/community-feed');
        }
      },
      {
        type: 'simple',
        title: 'Mindful Assistant',
        asset: '/assets/images/resources-entry-mindful-assistant.svg',
        description: 'Use Headspace to help navigate the stress and anxiety of chronic conditions.',
        action: () => {
          this.goTo('/resources/mindful-assistant');
        }
      },      

    ];
  }
  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
