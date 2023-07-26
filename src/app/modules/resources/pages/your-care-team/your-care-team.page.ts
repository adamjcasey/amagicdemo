import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'automagic-your-care-team',
  templateUrl: './your-care-team.page.html',
  styleUrls: ['./your-care-team.page.scss'],
})
export class YourCareTeamPage implements OnInit {
  public heroConfig: any;

  constructor() { }

  ngOnInit() {
    this.heroConfig = {
      color: 'var(--color-bg-pastel-blue)',
      template: `
        <h1 class="font-heading-1--bold">Your Care Team</h1>
       `,
       actions: [],
    }
  }
}
