import { Component } from '@angular/core';

@Component({
  selector: 'automagic-your-progress',
  templateUrl: 'your-progress.page.html',
  styleUrls: ['your-progress.page.scss'],
})
export class YourProgressPage {
  public heroConfig: any;
  public cards: any[];

  constructor() {
    this.heroConfig = {
      color: '--color-bg-pastel-honey-yellow',
      template: '<h1 class="font-heading-1--bold">Your progress</h1>',
    }

    this.cards = [
      {
        asset: '/assets/images/your-progress-percentage.svg',
        description: 'Weekly flareups have declined by <strong>57%</strong> over ten weeks!',
      },
      {
        asset: '/assets/images/your-progress-apple-health.svg',
        description: `
          <h5>Apple Health</h5>
          <p>Enabling integration with collects health and fitness data from your iPhone.</p>
        `,
        link: {
          label: 'Let’s start',
          action: () => {
            console.log('action your progress card');
          }
        },
      },
      {
        description: `
          <img src="/assets/images/activity-page-dose-report-widget.svg">
        `,
        button: {
          label: 'Import data from Apple Health',
          icon: '/assets/icons/import.svg',
          fill: 'outline',
          action: () => {
            console.log('click in import');
          }
        },
      }
    ];
  }

}
