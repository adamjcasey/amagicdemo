import {
  Component,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewContainerRef,
  QueryList,
  ElementRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

// Swiper Config
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination, EffectFade } from 'swiper';
SwiperCore.use([Pagination, EffectFade]);

import * as fromStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';
import * as fromWelcomeComponents from '@welcome/components';
import * as fromHomeStore from '@home/store';
import * as fromHomeComponents from '@home/components';
import * as fromActivityComponents from '@activity/components';
import * as fromCoreComponents from '@core/components';

@Component({
  selector: 'automagic-slider-page',
  templateUrl: 'slider-page.component.html',
  styleUrls: ['slider-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SliderPageComponent implements OnInit {
  public config$: Observable<any>;
  public homeConfig$: Observable<any>;
  public homeConfig: any;
  public previousConfig: any;
  public config: any;
  public isMoving: boolean = false;
  public currentSlide: any;

  public configHeaderTemplate: any;

  @Input() slides!: Array<any>;
  @Output() onPrevSlide = new EventEmitter<any>();
  @Output() onNextSlide = new EventEmitter<any>();
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('sliderHeader', { static: false }) sliderHeader!: SwiperComponent;
  @ViewChild('sliderContent', { static: false }) sliderContent!: SwiperComponent;
  @ViewChildren('componentHeader', { read: ViewContainerRef }) componentsHeader!: QueryList<ViewContainerRef>;
  @ViewChild('componentContent', { read: ViewContainerRef }) componentContent!: ViewContainerRef;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _sanitizer: DomSanitizer
  ) {
    this.config$ = this._store.select(fromStore.getSliderPageConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
  }

  ngOnInit() {
    this.currentSlide = this.slides[0];
    this.config$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(config => {
        if (config) {
          this.previousConfig = this.config;
          this.config = config;

          const currentComponentHeader = this.componentsHeader?.toArray()[this.sliderContent.swiperRef.activeIndex];
          // previous state: check if there is a component in the header
          if (this.previousConfig?.header?.component) {
            // current state: check if there is a component in the header
            if (this.config.header?.component) {
              // check if the previous and the current components are differents
              if (this.config.header?.component !== this.previousConfig?.header?.component) {
                // clear previosly to avoid duplicated components
                currentComponentHeader.clear();
                // load component in the header
                this._loadComponent(
                  currentComponentHeader, 
                  this.config.header.component
                );
              }
            }
          }
          else {
            // current state: check if there is a component in the header
            if (this.config.header?.component) {
              if (currentComponentHeader) {
                // clear previosly to avoid duplicated components
                currentComponentHeader.clear();
                // load component in the header
                this._loadComponent(
                  currentComponentHeader, 
                  this.config.header.component
                );
              }
            }
          }

          // previous state: check if there is a component in the content
          if (this.previousConfig?.content?.component) {
            // current state: check if there is a component in the content
            if (this.config.content?.component) {
              // check if the previous and the current components are differents
              if (this.config.content?.component !== this.previousConfig?.content?.component) {
                // clear previosly to avoid duplicated components
                this.componentContent.clear();
                // load component in the content
                this._loadComponent(
                  this.componentContent, 
                  this.config.content.component
                );
              }
            }
            else {
              // clear previosly to avoid duplicated components
              this.componentContent.clear();
            }
          }
          else {
            // current state: check if there is a component in the content
            if (this.config.content?.component) {
              // clear previosly to avoid duplicated components
              this.componentContent?.clear();
              // load component in the content
              this._loadComponent(
                this.componentContent, 
                this.config.content.component
              );
            }
          }

          if (this.config.moveTo) {
            this.slideTo(this.config.moveTo);
          }
          if (this.config.movePrev && !this.isMoving) {
            this.slidePrev();
          }
          if (this.config.moveNext && !this.isMoving) {
            this.slideNext();
          }
        }
      });

    this.homeConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(homeConfig => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  onSliderInit() {  
    this.currentSlide = this.slides[0];
    if (this.currentSlide.header) {
      // set initial config the header section
      this._store.dispatch(new fromStore.SliderPageSetHeaderOptions({
        ...this.currentSlide.header,
      }));
    }

    if (this.currentSlide.content) {
      // set initial config the content section
      // set form as null in order to don't include it in the store
      // if form: FormGroup it's included in the store will be inmutable
      this._store.dispatch(new fromStore.SliderPageSetContentOptions({
        ...this.currentSlide.content,
        form: null,
      }));
    }
  }

  onSlideChange() {
    const swiperActiveIndex = this.sliderContent.swiperRef.activeIndex;
    this.currentSlide = this.slides[swiperActiveIndex];
    if (this.currentSlide.header) {
      // update config for header section based on the currentSlide
      this._store.dispatch(new fromStore.SliderPageSetHeaderOptions({
        ...this.currentSlide.header,
      }));
    }
    if (this.currentSlide.content) {
      // update config for content section based on the currentSlide
      // set form as null in order to don't include it in the store
      // if form: FormGroup it's included in the store will be inmutable
      this._store.dispatch(new fromStore.SliderPageSetContentOptions({
        ...this.currentSlide.content,
        form: null,
      }));
    }

    if (this.currentSlide.onLoad) {
      this.currentSlide.onLoad();
    }
  }

  slidePrev() {
    this.isMoving = true;
    const activeIndex = this.sliderContent.swiperRef.activeIndex;
    if (this.slides[activeIndex].header?.component !== null) {
      this.componentsHeader?.toArray()[activeIndex].clear();
    }

    if (this.onPrevSlide.observers.length > 0) {
      this.onPrevSlide.emit({
        asset: this.sliderHeader.swiperRef,
        content: this.sliderContent.swiperRef,
      })
    }
    else {
      this.sliderHeader.swiperRef.slidePrev(500);
      this.sliderContent.swiperRef.slidePrev(500);
    }

    setTimeout(() => {
      this.isMoving = false;
      this._store.dispatch(new fromStore.SliderPageClearMovement);
    }, 500);
  }

  slideNext() {
    const activeIndex = this.sliderContent.swiperRef.activeIndex;
    if (this.slides[activeIndex].header?.component !== null) {
      this.componentsHeader?.toArray()[activeIndex].clear();
    }

    if (this.onNextSlide.observers.length > 0) {
      this.onNextSlide.emit({
        asset: this.sliderHeader.swiperRef,
        content: this.sliderContent.swiperRef,
      })
    }
    else {
      this.sliderHeader.swiperRef.slideNext(500);
      this.sliderContent.swiperRef.slideNext(500);
    }

    setTimeout(() => {
      this.isMoving = false;
      this._store.dispatch(new fromStore.SliderPageClearMovement);
    }, 500);
  }

  slideTo(index: number) {
    this.sliderHeader.swiperRef.slideTo(index);
    this.sliderContent.swiperRef.slideTo(index);
  }

  handlerEnterKey(event: any) {
    if (this.wrapper) {
      const field = event.target;
      const form = event.currentTarget.parentElement.parentElement;
      if (form.children.length > 1) {
        // if there more than 1 field
      }
      else {
        field.blur();
      }

      const actions = this.config.content?.isExpanded 
        ? this.wrapper.nativeElement.querySelector('.slider-page__content .wrapper-large .wrapper-large__toolbar-actions')
        : this.wrapper.nativeElement.querySelector('.slider-page__content .wrapper-small .swiper-slide-active .actions-wrapper');

      if (actions) {
        const buttons = actions.children;
        if (buttons.length > 1) {
          buttons[buttons.length - 1].click();
        }
        else {
          buttons[0].click();
        }
      }
    }
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  private _loadComponent(element: ViewContainerRef, component: any) {
    let componentRef;
    switch(component) {
      case 'welcome-doses-selector':
        componentRef = element.createComponent(fromWelcomeComponents.WelcomeDosesSelectorComponent);
        if (componentRef.instance instanceof fromWelcomeComponents.WelcomeDosesSelectorComponent) {
          // Listen to the dosesSelected event
          componentRef.instance.onDosesChange.subscribe((doses: Date[]) => {
            // Handle the event in the parent component
            this._store.dispatch(new fromWelcomeStore.SetData({
              doses: doses,
            }));
            this._store.dispatch(new fromHomeStore.SetData({
              doses: this.homeConfig.doses.map((dose: any, index: number) => {
                return {
                  ...dose,
                  date: doses[index]
                }
              }),
            }));
          });
        }
        break;
      case 'start-dose-prepare-temp-timer':
        componentRef = element.createComponent(fromHomeComponents.StartDosePrepareTempTimerComponent);
        break;
      case 'start-dose-prepare-setup':
        componentRef = element.createComponent(fromHomeComponents.StartDosePrepareSetupComponent);
        break;
      case 'start-dose-prepare-survey':
        componentRef = element.createComponent(fromHomeComponents.StartDosePrepareSurveyComponent);
        break;
      case 'start-dose-prepare-waiting-to-inject':
        componentRef = element.createComponent(fromHomeComponents.StartDosePrepareWaitingToInjectComponent);
        break;
      case 'start-dose-ready-to-inject-first-time-user':
        componentRef = element.createComponent(fromHomeComponents.StartDoseReadyToInjectFirstTimeUserComponent);
        if (componentRef.instance instanceof fromHomeComponents.StartDoseReadyToInjectFirstTimeUserComponent) {
          componentRef.instance.onPlayTrainingVideo.subscribe(() => {
            this.slideNext();
          });
        }
        break;
      case 'start-dose-ready-to-inject-video':
        componentRef = element.createComponent(fromHomeComponents.StartDoseReadyToInjectVideoComponent);
        break;
      case 'start-dose-ready-to-inject-body-part-selector':
        componentRef = element.createComponent(fromHomeComponents.StartDoseReadyToInjectBodyPartSelectorComponent);
        break;
      case 'start-dose-ready-to-inject-waiting-to-start-injection':
        componentRef = element.createComponent(fromHomeComponents.StartDoseReadyToInjectWaitingToStartInjectionComponent);
        break;
      case 'start-dose-ready-to-inject-dosing':
        componentRef = element.createComponent(fromHomeComponents.StartDoseReadyToInjectDosingComponent);
        break;
      case 'start-dose-inject-done-progress':
        componentRef = element.createComponent(fromHomeComponents.StartDoseInjectDoneProgressComponent);
        break;
      case 'start-dose-inject-dose-notes':
        componentRef = element.createComponent(fromHomeComponents.StartDoseInjectDoseNotesFormComponent);
        break;
      case 'start-dose-inject-done-report':
        componentRef = element.createComponent(fromHomeComponents.StartDoseInjectDoneReportComponent);
        break;
      case 'add-symptom-form':
        componentRef = element.createComponent(fromCoreComponents.AddSymptomFormComponent);
        break;
      case 'calendar-doses':
        componentRef = element.createComponent(fromActivityComponents.CalendarDosesComponent);
        break;
      case 'calendar-edit-schedule':
        componentRef = element.createComponent(fromActivityComponents.CalendarEditScheduleComponent);
        break;
    }
  }
}
