import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';
import * as fromServicesShared from '@shared/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'automagic-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  public welcomeState$!: Observable<any>;
  public welcomeConfig!: any;
  public backdropConfig$!: Observable<any>;
  public backdropConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
  public initialized: boolean = false;
  public heroConfig: any;
  public card: any;
  public name: string = '';
  public onBoardingTasks!: any[];
  public activityHighlights!: any[];
  public careTeam!: any[];
  public completedTasks: number = 6;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _utils: fromServicesShared.UtilsService
  ) {
    this.welcomeState$ = this._store.select(fromWelcomeStore.getWelcomeConfig);
    this.backdropConfig$ = this._store.select(fromSharedStore.getBackdropConfig);
    this.homeConfig$ = this._store.select(fromStore.getHomeConfig);

    this.heroConfig = {
      color: '--color-bg-pastel-green',
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
    this.onBoardingTasks = [
      {
        type: 'task',
        tabColor: '--color-bg-pastel-purple',
        title: 'Activity Calendar',
        description: 'This calendar tracks doses and flareups and reminders.',
        asset: '/assets/images/onboarding-task-1.svg'
      },
      {
        type: 'task',
        tabColor: '--color-bg-pastel-purple',
        title: 'Activity Dose Report',
        description: 'Make a note of your symptoms to see Theryx® at work.',
        asset: '/assets/images/onboarding-task-2.svg'
      },
      {
        type: 'task',
        tabColor: '--color-bg-pastel-purple',
        title: 'Activity Progress',
        description: 'Make a note of your symptoms to see Theryx® at work.',
        asset: '/assets/images/onboarding-task-3.svg'
      },
      {
        type: 'task',
        tabColor: '--color-bg-pastel-purple',
        title: 'Activity Symptom Report',
        description: 'Review individual symptom recordings to track progress.',
        asset: '/assets/images/onboarding-task-4.svg'
      },
      {
        type: 'task',
        tabColor: '--color-bg-pastel-purple',
        title: 'Resources',
        description: 'Make a note of your symptoms to see Theryx® at work.',
        asset: '/assets/images/onboarding-task-5.svg'
      },
      {
        type: 'task',
        tabColor: '--color-bg-pastel-purple',
        title: 'Care Team',
        description: 'Make a note of your symptoms to see Theryx® at work.',
        asset: '/assets/images/onboarding-task-6.svg'
      }
    ];
    this.careTeam = [
      {
        type: 'contact',
        asset: '/assets/images/care-team-avatar-1.svg',
        title: 'Dr. James David',
        position: 'Primary Care Physician',
        email: '#',
        video: '#',
        phone: '#',
      },
      {
        type: 'contact',
        asset: '/assets/images/care-team-avatar-2.svg',
        title: 'Dr. Jess Santiago',
        position: 'Primary Care Physician',
        email: '#',
        video: '#',
        phone: '#',
      }
    ];
  }

  ngOnInit() {
    this._store.dispatch(new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green'));
    this.welcomeState$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(welcomeState => {
        if (welcomeState) {
          this.welcomeConfig = welcomeState;
          this.name = welcomeState.name;

          // if you are in development and want to skip welcome flow
          if (!environment.production && this.name === '') {
            this.name = 'Jhon Doe';
          }

          if (this.name !== '') {
            this.heroConfig.template = `
              <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
              <h5>Welcome to wellness on your schedule.</h5>
              <p>Ready to start your Theryx® injections?<br> Your first guided injection will take about <strong>10 minutes.</strong></p>
            `;
          }
        }
      });

    this.backdropConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(backdropConfig => {
        if (backdropConfig) {
          this.backdropConfig = backdropConfig;
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
          if (this.homeConfig.doses) {
            // fill up with the doses on WelcomeState the doses for HomeConfig
            if (this.homeConfig.doses[0].date === '') {
              this._store.dispatch(new fromStore.SetData({
                doses: this.homeConfig.doses.map((dose: any, index: number) => {
                  return {
                    marked: dose.marked,
                    date: this.welcomeConfig.doses[index],
                    body: dose.bodyPart,
                    notes: dose.notes,
                  }
                })
              }));
            }

            const markedDoses = this.homeConfig.doses.filter((dose: any) => dose.marked);
            // user has completed at least the first dose
            if (markedDoses.length > 0) {
              // only first dose completed
              if (markedDoses.length === 1) {
                if (!this.homeConfig.firstTimeDose) {
                  if (!this.homeConfig.timeTravelingDemoDone) {
                    // update template in the hero component
                    const unMarkedDoses = this.homeConfig.doses.filter((dose: any) => !dose.marked);
                    const nextDose = unMarkedDoses[0];
                    const nextDoseDateFormatter = moment(nextDose.date).format('D MMMM YYYY');
                    this.heroConfig.template = `
                      <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                      <p>Your next Theryx® dose is scheduled for<br> <stong>${nextDoseDateFormatter}</stong></p>
                    `;

                    setTimeout(() => {
                      this.startTimeTravelingSimulation();

                      // DEMO: only for demo purposes
                      setTimeout(() => {
                        this.heroConfig.template = `
                          <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                          <p>Your Theryx® dose is scheduled for today!</p>
                        `;
                      }, 800);
                    }, 2000);
                  }
                  else { 
                    if (!this.homeConfig.flareUpsDemoDone) {
                      setTimeout(() => {
                        this.startFlareUpsFlow();
                      }, 600);
                    }
                    else {
                      // DEMO: only for demo purposes
                      this.heroConfig.template = `
                        <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                        <p>Your Theryx® dose is scheduled for today!</p>
                      `;

                      setTimeout(() => {
                        this._store.dispatch(new fromSharedStore.BackdropShow({
                          transition: 'move',
                          fullScreen: true,
                          bgTemplate: 'top-hole',
                          header: true,
                          template: `
                            <h1 class="font-heading-1--bold">Start dose</h1>
                            <p>You should start dose to continue the demo</p>
                          `,
                          onClose: () => {
                            // TODO: Highlight Start Dose button in homepage
                          }
                        }));
                      }, 1000);
                    }
                  }
                }
              }
              else {
                // user has completed 1 or more doses
                // get last dose injected data to be showed on Dose report widget
                const lastMarkedDose = markedDoses[markedDoses.length - 1];
                if (lastMarkedDose) {
                  this.activityHighlights = [
                    {
                      type: 'dose-report',
                      tabColor: '--color-bg-pastel-blue',
                      title: 'Dose Report',
                      numberDose: this.homeConfig.doses.findIndex((dose: any) => dose.date === lastMarkedDose.date) + 1,
                      time: moment(lastMarkedDose.date).format('MMM D, H:mm A'),
                      asset: `assets/images/activity-highlights-dose-report-${lastMarkedDose.bodyPart.toLowerCase().replace(' ', '-')}.svg`,
                      description: `This time you injected your <strong>${this._utils.humanizeBodyPartInjected(lastMarkedDose.bodyPart)}<strong>`,
                    },
                    {
                      tabColor: '--color-bg-pastel-honey-yellow',
                      title: 'Your Progress',
                      asset: '/assets/images/activity-highlights-your-progress.svg'
                    },
                  ];
                }

                // user has completed 6 doses
                if (markedDoses.length === 6) {
                  if (!this.homeConfig.allCompletedDoses) {
                    this.startFinishGuidedDemoFlow();
                  }

                  // show the following dose in two weeks since last dose date
                  const lastDose = markedDoses[markedDoses.length - 1];
                  const lastDoseDate = moment(lastDose.date);
                  lastDoseDate.set('hour', moment().get('hour'));
                  lastDoseDate.set('minute', moment().get('minute'));
                  lastDoseDate.add(2, 'weeks');
                  const lastDoseDateFormatted = lastDoseDate.format('D MMMM YYYY');
                  this.heroConfig.template = `
                    <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                    <p>Your next Theryx® dose is scheduled for<br> <stong>${lastDoseDateFormatted}</stong></p>
                  `;
                }
                else {
                  // show in the hero description the date of the upcoming dose
                  const unMarkedDoses = this.homeConfig.doses.filter((dose: any) => !dose.marked);
                  const nextDose = unMarkedDoses[0];
                  const nextDoseDateFormatter = moment(nextDose.date).format('D MMMM YYYY');
                  this.heroConfig.template = `
                    <h1 class="font-heading-1--bold">Hi ${this.name}!</h1>
                    <p>Your next Theryx® dose is scheduled for<br> <stong>${nextDoseDateFormatter}</stong></p>
                  `;
                }
              }
            }
          }

          if (this.homeConfig.onBoardingTasks) {
            this.onBoardingTasks = this.homeConfig.onBoardingTasks.map((task: any, index: number) => {
              return {
                type: 'task',
                tabColor: '--color-bg-pastel-purple',
                completed: task.completed,
                title: task.title,
                description: task.description,
                asset: `/assets/images/onboarding-task-${index + 1}.svg`,
              }
            });
          }
        }
      });
  }

  ngAfterViewInit() {
    this.initialized = true;
    const markedDoses = this.homeConfig.doses.filter((dose: any) => dose.marked);
    if (this.homeConfig.firstTimeDose && markedDoses.length === 0) {
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

  startTimeTravelingSimulation() {
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
  }

  startFlareUpsFlow() {
    this._store.dispatch(new fromSharedStore.BackdropShow({
      transition: 'move',
      header: true,
      template: `
        <img src="assets/images/flare-up-backdrop-image.svg" />
        <h1 class="font-heading-1--bold">Pretend you’ve got a flare-up...</h1>
        <p>To demonstrate the capabilities of a connected ecosystem, we’re going to simulate a symptom flare-up that can be detected by your watch.</p>
      `,
      buttons: [
        {
          label: 'Simulate flare-up',
          action: () => {
            this._store.dispatch(new fromSharedStore.BackdropClose());
          },
        }
      ],
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
              },
            }
          ],
          onClose: () => {
            this.goTo('home/add-symptom');
          }
        }));
      }
    }));
  }

  startFinishGuidedDemoFlow() {
    this._store.dispatch(new fromSharedStore.BackdropShow({
      transition: 'move',
      header: true,
      component: 'highlights-menu',
      template: null,
      contentCentered: true,
    }));
  }

  onTaskChange(value: any, index: number) {
    this.onBoardingTasks[index].completed = value;
    if (value) {
      this.completedTasks = this.completedTasks - 1;
    }
    else {
      this.completedTasks = this.completedTasks + 1;
    }
    
    this._store.dispatch(new fromStore.SetData({
      onBoardingTasks: this.onBoardingTasks
    }));
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
