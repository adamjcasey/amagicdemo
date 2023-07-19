import { Component, AfterViewInit, AfterContentInit, AfterContentChecked, AfterViewChecked } from '@angular/core';

import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-resources',
  templateUrl: 'resources.page.html',
  styleUrls: ['resources.page.scss'],
})
export class ResourcesPage implements AfterViewChecked {
  public cards: any[];

  constructor(
    private _utils: fromSharedServices.UtilsService
  ) {
    this.cards = [
      {
        type: 'simple',
        title: 'Care Team',
        asset: '/assets/images/resources-entry-care-team.svg',
        description: 'Connect to your health care providers for holistic care.',
        action: () => {
          console.log('action go to Care Team');
        }
      },
      {
        type: 'simple',
        title: 'Community Feed',
        asset: '/assets/images/resources-entry-community-feed.svg',
        description: 'Connect to a larger community of fellow patients to learn tips and tricks.',
        action: () => {
          console.log('action go to Community Feed');
        }
      },
      {
        type: 'simple',
        title: 'Education',
        asset: '/assets/images/resources-entry-education.svg',
        description: 'Stay up-to-date and learn more about your condition and treatment.',
        action: () => {
          console.log('action go to Education');
        }
      },   
      {
        type: 'simple',
        title: 'Mindful Assistant',
        asset: '/assets/images/resources-entry-mindful-assistant.svg',
        description: 'Use Headspace to help navigate the stress and anxiety of chronic conditions.',
        action: () => {
          console.log('action go to Mindful Assistant');
        }
      },   
      {
        type: 'simple',
        title: 'OnePath',
        asset: '/assets/images/resources-entry-one-path.svg',
        description: 'Chat with your patient support manager (PSM).',
        action: () => {
          console.log('action go to OnePath');
        }
      },
    ];
  }

  ngAfterViewChecked() {
    const container = document.querySelector('.resources-page__container') as HTMLElement;
    if (container) {
      this._utils.createMasonryLayout(container);
    }
  }
}
