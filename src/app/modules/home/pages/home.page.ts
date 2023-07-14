import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';

@Component({
  selector: 'automagic-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  public welcomeState$!: Observable<any>;
  public welcomeState: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public heroConfig: any;
  public card: any;
  public name: string = '';

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.welcomeState$ = this._store.select(fromWelcomeStore.getWelcomeState);
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);
    this.card = {
      asset: '/assets/images/note.svg',
      title: 'Track your progress',
      description: 'Make a note of your symptoms to see Theryx® at work.',
      link: {
        label: 'Let’s start',
        action: () => {
          console.log('action home page card');
        }
      },
    }
  }

  ngOnInit() {
    this.welcomeState$.subscribe(welcomeState => {
      if (welcomeState) {
        this.welcomeState = welcomeState;
        this.name = this.welcomeState.name;
        if (this.name !== '') {
          this.heroConfig = {
            color: 'var(--color-bg-pastel-green)',
            image: '/assets/images/homepage.svg',
            template: `
              <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
              <h5>Welcome to wellness on your schedule.</h5>
              <p>Ready to start your Theryx® injections?<br> Your first guided injection will take about <strong>10 minutes.</strong></p>
            `,
            actions: [
              {
                label: 'Start dose',
                action: () => {
                  this.goTo('/home/start-dose/prepare');
                }
              }
            ]
          }
        }
      }
    });

    this.homeConfig$.subscribe(homeConfig => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
        if (!this.homeConfig.firstTimeDose) {
          if (this.homeConfig.doses) {
            const markedDoses = this.homeConfig.doses.filter((dose: any) => dose.marked);
            if (markedDoses.length) {
              const unmarkedDoses = this.homeConfig.doses.filter((dose: any) => dose.marked);
              console.log('unmarkedDoses ', unmarkedDoses);
              const nextDoseDate = moment(unmarkedDoses[0].date);
              console.log('nextDose ', unmarkedDoses[0]);
              console.log('nextDoseDate ', nextDoseDate.format('DD/MM/YYYY'));
              // if the next dose if is today, the message change
              if (nextDoseDate.format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
                console.log('nextDose is today');
                this.heroConfig.template = `
                  <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                  <p> Your Theryx® dose is scheduled for today!</p>
                `;
              }
              // if not show the next dose scheduled date
              else {
                console.log('nextDose no is today');
                const nextDoseDateFormated = nextDoseDate.format('D MMMM YYYY');
                this.heroConfig.template = `
                  <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                  <h5>Welcome to wellness on your schedule.</h5>
                  <p>Your next Theryx® dose is scheduled for<br> <stong>${nextDoseDateFormated}</stong></p>
                `;
              }

              // if the first one dose was injected, for the demo purpose we'll fill 
              // automatically 5 doses to leave the user in the last dose
              if (markedDoses.length === 1) {
                console.log('hay una dose marked');
                console.log('va a poner las 5 stars');
                this._store.dispatch(new fromStore.SetData({
                  doses: this.homeConfig.doses.map((dose: any, index: number) => {
                    return {
                      marked: index + 1 < this.homeConfig.doses.length 
                        ? true 
                        : false,
                      date: index + 1 < this.homeConfig.doses.length 
                        ? moment().add(index, 'week').toString() 
                        : '',
                    }
                  }),
                }));
              }
            }
          }

          if (!this.homeConfig.flareUpsDemoDone) {
            // Flare Up flow starting
            setTimeout(() => {
              this._store.dispatch(new fromSharedStore.BackdropShow({
                transition: 'move',
                header: true,
                template: `
                  <img src="assets/images/flare-up-backdrop-image.svg" />
                  <h1 class="font-heading-1--bold">Pretend you’ve got a flare-up...</h1>
                  <p>To demonstrate the capabilities of a connected ecosystem, we’re going to simulate a symptom flare-up that can be detected by your watch.</p>
                  <ion-button fill="outline" expand="block" color="light" onclick="window.flareUpsFlow.simulateFlareUp()">
                    Simulate flare-up
                  </ion-button>
                `,
              }));
            }, 600);
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    if (this.homeConfig.firstTimeDose) {
      this._store.dispatch(new fromSharedStore.BackdropShow({
        transition: 'move',
        fullScreen: true,
        header: true,
        bgTemplate: 'top-hole',
        backButton: {
          label: 'Menu',
          action: () => {
            this._store.dispatch(new fromSharedStore.BackdropShow({
              template: null,
              component: null,
            }));
          }
        },
        template: `
          <h1 class="font-heading-1--bold">Dose Day</h1>
          <p>For this demo, let's pretend that <br>you're scheduled for your first at-<br>home dose today</p>
        `,
      }));
    }

    window.flareUpsFlow = {
      simulateFlareUp: () => {
        this._store.dispatch(new fromSharedStore.BackdropClose);
        this._store.dispatch(new fromSharedStore.AlertShow({
          mode: 'full',
          template: `
            <img src="assets/images/flare-ups-alert-image.svg" />
            <h1 class="font-heading-1--bold">Experiencing a flare-up?</h1>
            <p>Your wearable data suggests that you’re experiencing a new symptom. Want to record it?</p>
          `,
          actions: [
            {
              label: 'Ok, let’s go!',
              fill: 'outline',
              action: () => { 
                this._store.dispatch(new fromSharedStore.AlertClose);
                this.goTo('home/add-symptom');
              },
            }
          ],
        }));
      }
    }
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
