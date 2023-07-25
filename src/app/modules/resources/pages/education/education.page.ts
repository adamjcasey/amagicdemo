import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'automagic-education',
  templateUrl: './education.page.html',
  styleUrls: ['./education.page.scss'],
})
export class EducationPage implements OnInit {
  public heroConfig: any;

  constructor() { }

  ngOnInit() {
    this.heroConfig = {
      color: 'var(--color-bg-pastel-honey-yellow)',
      template: `
        <h1 class="font-heading-1--bold">Education</h1>
       `,
       actions: [],
    }
  }
}
