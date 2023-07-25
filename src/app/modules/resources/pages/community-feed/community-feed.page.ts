import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'automagic-community-feed',
  templateUrl: './community-feed.page.html',
  styleUrls: ['./community-feed.page.scss'],
})
export class CommunityFeedPage implements OnInit {
  public heroConfig: any;

  constructor() { }

  ngOnInit() {
    this.heroConfig = {
      color: 'var(--color-bg-pastel-mint)',
      template: `
        <h1 class="font-heading-1--bold">Community Feed</h1>
       `,
       actions: [],
    }
  }
}
