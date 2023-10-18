import { 
  Component,
  ViewEncapsulation, 
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { animate, spring } from 'motion';

import * as fromStore from '@home/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-start-guided-demo',
  templateUrl: 'start-guided-demo.component.html',
  styleUrls: ['start-guided-demo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartGuidedDemoComponent implements OnInit, OnDestroy {
  public backdropConfig$!: Observable<any>;
  public backdropConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.backdropConfig$ = this._store.select(fromSharedStore.getBackdropConfig);
  }

  ngOnInit() {
    this.backdropConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(backdropConfig => {
        if (backdropConfig) {
          this.backdropConfig = backdropConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  showHighlightsTour () {
    if (!this.backdropConfig.fullScreen) {
      animate(
        '#backdrop .backdrop__wrapper',
        {
          height: [
            `${window.innerHeight * 0.75}px`,
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
      contentCentered: false,
      showBackButton: true,
      highlights: [
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
  }

  startExploring() {
    this._store.dispatch(new fromSharedStore.BackdropHide);
    this._store.dispatch(new fromStore.SetData({
      allCompletedDoses: true
    }));

    setTimeout(() => {
      this._store.dispatch(new fromSharedStore.BackdropShow({
        transition: 'move',
        fullScreen: true,
        header: true,
        bgTemplate: 'bottom-ellipse-hole',
        showBackButton: false,
        template: `
          <div class="start-guided-demo-message">
            <h1 class="font-heading-1--bold">You're free to explore!</h1>
            <p>Use the onboarding cards here to track where you've been and what's left to explore</p>
          </div>
        `,
        buttons: [
          {
            label: 'Got it',
            action: () => {
              this._store.dispatch(new fromSharedStore.BackdropHide);
            },
          }
        ]
      }));
    }, 1300);
  }
}
