import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'automagic-one-path',
  templateUrl: './one-path.page.html',
  styleUrls: ['./one-path.page.scss']
})
export class OnePathPage implements OnInit {
  public heroConfig: any;

  constructor() { 
   }

  ngOnInit() {
    this.heroConfig = {
      color: 'var(--color-bg-pastel-honey-yellow)',
      template: `
        <h1 class="font-heading-1--bold">OnePath PSM Chat</h1>
       `,
       actions: [],
       icon: '/assets/images/resources-onepath-psm-icon.svg'
    }
  }
}
