import { Component } from '@angular/core';

@Component({
  selector: 'automagic-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public heroConfig: any;
  public card: any;

  constructor() {
    this.heroConfig = {
      color: 'var(--color-bg-pastel-green)',
      image: '/assets/images/homepage.svg',
      template: `
        <h1 class="font-heading-1--bold">Hi Marissa!</h1>
        <h5>Welcome to wellness on your schedule.</h5>
        <p>Ready to start your Theryx® injections?<br>Your first guided injection will take about <strong>10 minutes.</strong>
      `,
      actions: [
        {
          label: 'Start dose',
        }
      ]
    }

    this.card = {
      asset: '/assets/images/note.svg',
      title: 'Track your progress',
      description: 'Make a note of your symptoms to see Theryx® at work.',
      button: {
        label: 'Let’s start',
        action: () => {
          console.log('action home page card');
        }
      },
    }
  }

}
