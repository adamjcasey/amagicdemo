import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';
import { environment } from 'src/environments/environment';

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
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

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
    this.welcomeState$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(welcomeState => {
        if (welcomeState) {
          this.welcomeState = welcomeState;
          this.name = this.welcomeState.name;

          // if you are in development and want to skip welcome flow
          if (!environment.production && this.name === '') {
            this.name = 'Jhon Doe';
          }

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

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          if (this.homeConfig.doses) {
            const markedDoses = this.homeConfig.doses.filter((dose: any) => dose.marked);
            if (markedDoses.length === 1) {
              // TODO: move this logic to be exec after saving the 
              // Settings Page > Setup Reminders
              // setTimeout(() => {
              //   this._store.dispatch(new fromSharedStore.AlertShow({
              //     mode: 'full',
              //     template: `
              //       <img src="assets/images/alert-setup-reminders.svg" />
              //       <h1 class="font-heading-1--bold">Smart reminders saved</h1>
              //       <p>AutoMagic will learn from your selections to improve recommendations.</p>
              //     `,
              //     actions: [
              //       {
              //         label: 'Ok, let’s go!',
              //         action: () => {
              //           this._store.dispatch(new fromSharedStore.AlertClose());
              //           this._store.dispatch(new fromStore.SetData({
              //             firstTimeDose: this.homeConfig.firstTimeDose ? false : this.homeConfig.firstTimeDose
              //           }));
              //         },
              //       }
              //     ],
              //   }));
              // }, 500);

              if (!this.homeConfig.timeTravelingDemoDone) {
                setTimeout(() => {
                  this._store.dispatch(new fromSharedStore.BackdropShow({
                    transition: 'move',
                    header: true,
                    template: `
                      <div class="time-traveling">
                        <video 
                          id="time-traveling-video"
                          src="/assets/videos/time-traveling.mp4" 
                          autoplay
                          muted
                          playsinline
                        ></video>
                      </div>
                    `,
                    onClose: () => {
                      setTimeout(() => {
                        this._store.dispatch(new fromStore.SetData({
                          timeTravelingDemoDone: true,
                        }));
                      }, 600);
                    }
                  }));
                }, 600);
              }
              else {
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
                        <ion-button fill="outline" expand="block" color="light" onclick="window.backdropComponent.close()">
                          Simulate flare-up
                        </ion-button>
                      `,
                      onClose: () => {
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
                    }));
                  }, 600);
                }
              }
            }

            if (markedDoses.length >= 1) {
              const unmarkedDoses = this.homeConfig.doses.filter((dose: any) => !dose.marked);
              if (unmarkedDoses.length > 0) {
                const nextDoseDate = moment(unmarkedDoses[0].date);
                // if the next dose if is today, the message change
                if (nextDoseDate.format('DD/MM/YYYY') === moment().format('DD/MM/YYYY')) {
                  this.heroConfig.template = `
                    <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                    <p> Your Theryx® dose is scheduled for today!</p>
                  `;
                }
                // if not show the next dose scheduled date
                else {
                  const nextDoseDateFormated = nextDoseDate.format('D MMMM YYYY');
                  this.heroConfig.template = `
                    <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                    <h5>Welcome to wellness on your schedule.</h5>
                    <p>Your next Theryx® dose is scheduled for<br> <stong>${nextDoseDateFormated}</stong></p>
                  `;
                }
              }

              if (markedDoses.length === 6) {
                console.log('marked all 6 doses change hero homepage template');
              }
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
        template: `
          <h1 class="font-heading-1--bold">Dose Day</h1>
          <p>For this demo, let's pretend that <br>you're scheduled for your first at-<br>home dose today</p>
        `,
      }));
    }
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
