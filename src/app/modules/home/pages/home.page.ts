import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import * as moment from 'moment';
import { animate, spring } from 'motion';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';
import * as fromSharedServices from '@shared/services';
import * as fromWelcomeStore from '@welcome/store';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'automagic-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  public welcomeState$!: Observable<any>;
  public backdropConfig$!: Observable<any>;
  public backdropConfig: any;
  public homeConfig$!: Observable<any>;
  public homeConfig: any;
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
  ) {
    this.welcomeState$ = this._store.select(fromWelcomeStore.getWelcomeState);
    this.backdropConfig$ = this._store.select(fromSharedStore.getBackdropConfig);
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
    this.welcomeState$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(welcomeState => {
        if (welcomeState) {
          this.name = welcomeState.name;

          // if you are in development and want to skip welcome flow
          if (!environment.production && this.name === '') {
            this.name = 'Jhon Doe';
          }

          if (this.name !== '') {
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
                else {
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
                if (!this.homeConfig.allCompletedDoses) {
                  this.finishDemoGuide();
                }
              }

              const lastMarkedDose = markedDoses[markedDoses.length - 1];
              this.activityHighlights = [
                {
                  type: 'dose-report',
                  tabColor: '--color-bg-pastel-blue',
                  title: 'Dose Report',
                  numberDose: this.homeConfig.doses.findIndex((dose: any) => dose.date === lastMarkedDose.date) + 1,
                  time: moment(lastMarkedDose.date).format('MMM D, H:m A'),
                  asset: `assets/images/activity-highlights-dose-report-${lastMarkedDose.bodyPart.toLowerCase().replace(' ', '-')}.svg`,
                  description: `This time you injected your <strong>${lastMarkedDose.bodyPart}<strong>`,
                },
                {
                  tabColor: '--color-bg-pastel-honey-yellow',
                  title: 'Your Progress',
                  asset: '/assets/images/activity-highlights-your-progress.svg'
                },
              ];
            }
          }
        }
      });

    window.homepage = {
      showHighlightsTour: () => {
        if (!this.backdropConfig.fullScreen) {
          // animation to pass from default to fullScreen in backdrop component
          animate(
            "#backdrop",
            {
              height: [
                `${window.innerHeight * 0.5}px`,
                `${window.innerHeight * 0.6}px`,
                `${window.innerHeight * 0.7}px`,
                `${window.innerHeight * 0.8}px`,
                `${window.innerHeight * 0.9}px`,
                `${window.innerHeight}px`
              ],
            },
            { easing: spring({
              stiffness: 100,
              damping: 15,
              mass: 1,
              velocity: 800,
            }) }
          );
        }

        this._store.dispatch(new fromSharedStore.BackdropSetConfig({
          fullScreen: true,
          template: null,
          component: null,
          hightlights: [
            {
              type: 'simple',
              asset: '/assets/images/highlights-1.svg',
              title: 'Takeda Benefits',
              description: 'Explore how this connected vision creates improved Patient, Trust, Reputation, and Business opportunities.',
              detail: `
                <h1 class="font-heading-1--bold">Takeda Benefits</h1>
                <div class="highlights__detail-section color-salmon">
                  <h2>Patient-centric approach</h2>
                  <ion-img src="/assets/images/take-benefits-1.svg"></ion-img>
              
                  <div class="box-wrapper">
                    <p class="indicator">1</p>
                    <h3>Supporting the holistic treatment experience</h3>
                    <p class="eyebrow">Patient</p>
                    <p>Supporting the holistic treatment experience at all stages of the journey (patient centricity goes beyond
                      providing a treatment/drug).</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">2</p>
                    <h3>Improving and Verifying Patient Outcomes</h3>
                      <p class="eyebrow">Patient</p>
                      <p>Improving patient patient outcomes by ensuring a full dose every time. </p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">3</p>
                    <h3>Real world patient data informs the business</h3>
                    <p class="eyebrow">Patient</p>
                    <p>Better understanding of the patient population with increased direct feedback and real-world data.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">4</p>
                    <h3>Increased patient access</h3>
                    <p class="eyebrow">Patient</p>
                    <p>Increased patient access to therapies through at-home, confident dosing.</p>
                  </div>
                </div>
              
                <div class="highlights__detail-section color-honey-yellow">
                  <h2>We collect, analyze, and act on real-world data</h2>
                  <ion-img src="/assets/images/take-benefits-2.svg"></ion-img>
              
                  <div class="box-wrapper">
                    <p class="indicator">1</p>
                    <h3>Strategic roadmap</h3>
                    <p class="eyebrow">Business</p>
                    <p>Informing our strategic roadmap to help leadership make data-driven decisions.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">2</p>
                    <h3>Iterative refinement</h3>
                    <p class="eyebrow">Reputation</p>
                    <p>Collecting data that helps us iteratively refine our therapies, technologies, delivery systems, and the patient
                      experience.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">3</p>
                    <h3>Privacy center</h3>
                    <p class="eyebrow">Trust</p>
                    <p>Making our patients comfortable and enthused about sharing data with us in a privacy-centric and liability
                      minimizing manner; gathering more and richer longitudinal patient data.</p>
                  </div>
                </div>
              
                <div class="highlights__detail-section color-green">
                  <h2>Prepared for Value-Based Care</h2>
                  <ion-img src="/assets/images/take-benefits-3.svg"></ion-img>
              
                  <div class="box-wrapper">
                    <p class="indicator">1</p>
                    <h3>Actionable data</h3>
                    <p class="eyebrow">Business</p>
                    <p>Collecting comprehensive, nuanced, and actionable data to meet requirements.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">2</p>
                    <h3>Patient protection</h3>
                      <p class="eyebrow">Reputation</p>
                      <p>Gathering data in a responsible way that protects patients.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">3</p>
                    <h3>Improved delivery experience</h3>
                    <p class="eyebrow">Trust</p>
                    <p>Demonstrating that an improved delivery experience improves adherence when negotiating with delivery partners.
                    </p>
                  </div>
                </div>
              
                <div class="highlights__detail-section color-tiffany-blue">
                  <h2>Takeda is a bioTECH innovation leader</h2>
                  <ion-img src="/assets/images/take-benefits-4.svg"></ion-img>
              
                  <div class="box-wrapper">
                    <p class="indicator">1</p>
                    <h3>Consumer tech quality</h3>
                    <p class="eyebrow">Reputation</p>
                    <p>Helping Takeda exceed consumer and competitive tech with seamless experiences.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">2</p>
                    <h3>Digital-forward company</h3>
                      <p class="eyebrow">Reputation</p>
                      <p>Evolving Takeda into a digital forward company that delivers on the tech in biotech.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">3</p>
                    <h3>Sustainability</h3>
                    <p class="eyebrow">Reputation</p>
                    <p>Promoting sustainability across the full lifecycle of drug delivery including packaging with thoughtful materials and user guidance.</p>
                  </div>
                </div>
              
                <div class="highlights__detail-section color-blue">
                  <h2>Clinical trials enhancement</h2>
                  <ion-img src="/assets/images/take-benefits-5.svg"></ion-img>
              
                  <div class="box-wrapper">
                    <p class="indicator">1</p>
                    <h3>Expanding the pool of patients</h3>
                    <p class="eyebrow">Patient</p>
                    <p>Enabling hybrid and decentralized clinical trials, expanding the pool of patients able to access care and participate.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">2</p>
                    <h3>Clinical trial integrity</h3>
                      <p class="eyebrow">Trust</p>
                      <p>Improving clinical trial integrity through patient adherence to trial protocols and regimens.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">3</p>
                    <h3>Patient reported outcomes (PROs)</h3>
                    <p class="eyebrow">Reputation</p>
                    <p>Improving the collection of patient reported outcomes (PROs) – including longitudinal and supplementary health data.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">4</p>
                    <h3>Post-market surveillance</h3>
                    <p class="eyebrow">Business</p>
                    <p>Continuing longitudinal data collection for post-market surveillance, beyond clinical trials.</p>
                  </div>
                </div>
              
                <div class="highlights__detail-section color-purple">
                  <h2>Increasing loyalty to Takeda's offerings in a world of future therapies</h2>
                  <ion-img src="/assets/images/take-benefits-6.svg"></ion-img>
              
                  <div class="box-wrapper">
                    <p class="indicator">1</p>
                    <h3>Improving the injectable experience</h3>
                    <p class="eyebrow">Business</p>
                    <p>To compete against other delivery methods and lower cost biosimilars.</p>
                  </div>
              
                  <div class="box-wrapper">
                    <p class="indicator">2</p>
                    <h3>Consumer-electronics ecosystem</h3>
                    <p class="eyebrow">Business</p>
                    <p>Creating a consumer-electronics ecosystem around the patient’s treatment.</p>
                  </div>
                </div>
              `,
            },
            {
              type: 'simple',
              asset: '/assets/images/highlights-2.svg',
              title: 'Safer than ever',
              description: 'Increasing Takeda’s ability to ensure drug authenticity and integrity while mitigating user error.',
            },
            {
              type: 'simple',
              asset: '/assets/images/highlights-3.svg',
              title: 'Integrations with EMR / AppleHealth',
              description: 'API based integrations with pharmacy, EMR, and Apple Health data.',
            },
            {
              type: 'simple',
              asset: '/assets/images/highlights-4.svg',
              title: 'Coordinating the healthcare ecosystem',
              description: 'Connecting patients to their care team and support network.',
            },
            {
              type: 'simple',
              asset: '/assets/images/highlights-5.svg',
              title: 'Helping build the habit',
              description: 'Encouraging proactive disease management by making  tracking easy and intuitive.',
            },
            {
              type: 'simple',
              asset: '/assets/images/highlights-6.svg',
              title: 'Patient Resources and Support',
              description: 'Connecting patients to community , education, and other resources for holistic support.',
            },
          ],
        }));
      },
      startExploring: () => {
        this._store.dispatch(new fromSharedStore.BackdropClose);
        this._store.dispatch(new fromStore.SetData({
          allCompletedDoses: true
        }));
      },
    }
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

  finishDemoGuide() {
    const template = `
      <h1 class="font-heading-1--bold">That’s it for the guided portion of the demo!</h1>
      <p>This  app has many more features and benefits to check out.</p>
      <div class="buttons-container">
        <ion-button fill="outline" expand="block" color="light" onclick="window.homepage.showHighlightsTour()">
          Just show me the highlights
        </ion-button>

        <ion-button fill="outline" expand="block" color="light" onclick="window.homepage.startExploring()">
          Let me explore like I’m a user
        </ion-button>
      </div>
    `;

    if (this.backdropConfig.show) {
      this._store.dispatch(new fromSharedStore.BackdropSetConfig({
        template: template,
      }));    
    }
    else {
      this._store.dispatch(new fromSharedStore.BackdropShow({
        transition: 'move',
        header: true,
        template: template,
      }));    
    }   
  }

  onTaskCheck(value: any, index: number) {
    this.onBoardingTasks[index].check = value;
    if (value) {
      this.completedTasks = this.completedTasks - 1;
    }
    else {
      this.completedTasks = this.completedTasks + 1;
    }
  }

  goTo(path: string) {
    this._store.dispatch(new fromCoreStore.Go({
      path: [path]
    }));
  }
}
