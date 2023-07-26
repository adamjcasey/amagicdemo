import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'automagic-your-care-team-add',
  templateUrl: './your-care-team-add.page.html',
  styleUrls: ['./your-care-team-add.page.scss'],
})
export class YourCareTeamAddPage implements OnInit {
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
