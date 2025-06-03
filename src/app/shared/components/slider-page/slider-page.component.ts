import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import type { SwiperContainer } from 'swiper/element';
import { register } from 'swiper/element/bundle';
import { EffectFade, Pagination } from 'swiper/modules';

register();

const SWIPER_NO_TOUCH_CONFIG = {
  allowTouchMove: false,
  touchRatio: 0,
  simulateTouch: false,
};

const SWIPER_NO_TOUCH_ATTRIBUTES = [
  ['allow-touch-move', 'false'],
  ['touch-ratio', '0'],
  ['simulate-touch', 'false'],
];

const applySwiperNoTouchAttributes = (element: HTMLElement) => {
  SWIPER_NO_TOUCH_ATTRIBUTES.forEach(([attr, value]) => {
    element.setAttribute(attr, value);
  });
};

import * as fromActivityComponents from '@activity/components';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicInnerHtmlDirective } from '@app/shared/directives';
import * as fromCoreComponents from '@core/components';
import * as fromCoreStore from '@core/store';
import * as fromHomeComponents from '@home/components';
import * as fromHomeStore from '@home/store';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { CardComponent } from '@shared/components';
import * as fromStore from '@shared/store';
import * as fromWelcomeComponents from '@welcome/components';
import * as fromWelcomeStore from '@welcome/store';

@Component({
  selector: 'automagic-slider-page',
  templateUrl: 'slider-page.component.html',
  styleUrls: ['slider-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    DynamicInnerHtmlDirective,
    IonInput,
    IonButton,
    IonIcon,
  ],
})
export class SliderPageComponent implements OnInit, OnDestroy {
  public config$: Observable<any>;
  public layoutConfig$: Observable<any>;
  public layoutConfig: any;
  public homeConfig$: Observable<any>;
  public homeConfig: any;
  public previousConfig: any;
  public config: any;
  public isMoving: boolean = false;
  public currentSlide: any;
  public blockNavigation: boolean = false;
  public configHeaderTemplate: any;

  @Input() slides!: Array<any>;
  @Output() prevSlide = new EventEmitter<any>();
  @Output() nextSlide = new EventEmitter<any>();
  @ViewChild('wrapper') wrapper!: ElementRef;
  @ViewChild('sliderHeader') sliderHeader!: ElementRef<SwiperContainer>;
  @ViewChild('sliderContent') sliderContent!: ElementRef<SwiperContainer>;
  @ViewChildren('componentHeader', { read: ViewContainerRef })
  componentsHeader!: QueryList<ViewContainerRef>;
  @ViewChild('componentContent', { read: ViewContainerRef })
  componentContent!: ViewContainerRef;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();

  headerSwiperModules = [EffectFade];
  contentSwiperModules = [EffectFade, Pagination];

  headerSwiperConfig = {
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    ...SWIPER_NO_TOUCH_CONFIG,
    speed: 500,
    modules: [EffectFade],
    lazy: false,
  };

  contentSwiperConfig = {
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    ...SWIPER_NO_TOUCH_CONFIG,
    pagination: {
      el: '.swiper-pagination',
    },
  };

  private _sanitizedContentCache: Map<string, SafeHtml> | null = null;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _sanitizer: DomSanitizer,
    private _cdr: ChangeDetectorRef
  ) {
    this.config$ = this._store.select(fromStore.getSliderPageConfig);
    this.homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  }

  ngOnInit() {
    this.initializeSwipers();

    this.currentSlide = this.slides[0];
    this.config$.pipe(takeUntil(this._ngUnsubscribe)).subscribe((config) => {
      if (config) {
        this.previousConfig = this.config;
        this.config = config;

        const currentComponentHeader =
          this.componentsHeader?.toArray()[
            this.sliderContent.nativeElement.swiper.activeIndex
          ];
        // previous state: check if there is a component in the header
        if (this.previousConfig?.header?.component) {
          // current state: check if there is a component in the header
          if (this.config.header?.component) {
            // check if the previous and the current components are differents
            if (
              this.config.header?.component !==
              this.previousConfig?.header?.component
            ) {
              if (currentComponentHeader) {
                // clear previosly to avoid duplicated components
                currentComponentHeader.clear();
                // load component in the header
                this._loadComponent(
                  currentComponentHeader,
                  this.config.header.component
                );
              } else {
                console.warn(
                  'currentComponentHeader is not initialized yet. Component will not be loaded:',
                  this.config.header.component
                );
              }
            }
          }
        } else {
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
            } else {
              console.warn(
                'currentComponentHeader is not initialized yet. Component will not be loaded:',
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
            if (
              this.config.content?.component !==
              this.previousConfig?.content?.component
            ) {
              // clear previosly to avoid duplicated components
              this.componentContent.clear();
              // load component in the content
              this._loadComponent(
                this.componentContent,
                this.config.content.component
              );
            }
          } else {
            // clear previosly to avoid duplicated components
            this.componentContent.clear();
          }
        } else {
          if (this.config.content?.component) {
            // Wait for the component to be initialized
            setTimeout(() => {
              if (this.componentContent) {
                this.componentContent.clear();
                this._loadComponent(
                  this.componentContent,
                  this.config.content.component
                );
              }
            });
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
      .subscribe((homeConfig) => {
        if (homeConfig) {
          this.homeConfig = homeConfig;
        }
      });

    this.layoutConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((layoutConfig) => {
        if (layoutConfig) {
          this.layoutConfig = layoutConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  onSliderInit() {
    if (this.slides.length === 0) {
      return;
    }

    this.currentSlide = this.slides[0];
    if (this.currentSlide.header) {
      // set initial config the header section
      this._store.dispatch(
        new fromStore.SliderPageSetHeaderOptions({
          ...this.currentSlide.header,
        })
      );
    }

    if (this.currentSlide.content) {
      // set initial config the content section
      // set form as null in order to don't include it in the store
      // if form: FormGroup it's included in the store will be inmutable
      this._store.dispatch(
        new fromStore.SliderPageSetContentOptions({
          ...this.currentSlide.content,
          form: null,
        })
      );
    }
  }

  onSlideChange() {
    const swiperActiveIndex =
      this.sliderContent.nativeElement.swiper.activeIndex;
    this.currentSlide = this.slides[swiperActiveIndex];

    if (this.currentSlide.header) {
      // update config for header section based on the currentSlide
      this._store.dispatch(
        new fromStore.SliderPageSetHeaderOptions({
          ...this.currentSlide.header,
          currentSlide: swiperActiveIndex,
        })
      );
    }
    if (this.currentSlide.content) {
      // update config for content section based on the currentSlide
      // set form as null in order to don't include it in the store
      // if form: FormGroup it's included in the store will be inmutable
      this._store.dispatch(
        new fromStore.SliderPageSetContentOptions({
          ...this.currentSlide.content,
          form: null,
          currentSlide: swiperActiveIndex,
          cards: this.currentSlide.content.cards || null,
        })
      );
    }

    if (this.currentSlide.onLoad) {
      this.currentSlide.onLoad();
    }

    if (this.config.content.blockNavigationFor) {
      this.blockNavigation = true;
      setTimeout(() => {
        this.blockNavigation = false;
        this.markForCheck();
      }, this.config.content.blockNavigationFor);
    }

    this.markForCheck();
  }

  slidePrev() {
    if (!this.blockNavigation) {
      this.isMoving = true;
      const activeIndex = this.sliderContent.nativeElement.swiper.activeIndex;
      if (this.slides[activeIndex].header?.component !== null) {
        this.componentsHeader?.toArray()[activeIndex].clear();
      }

      if (this.prevSlide.observers.length > 0) {
        this.prevSlide.emit({
          asset: this.sliderHeader.nativeElement.swiper,
          content: this.sliderContent.nativeElement.swiper,
        });
      } else {
        this.sliderHeader.nativeElement.swiper.slidePrev(500);
        this.sliderContent.nativeElement.swiper.slidePrev(500);
      }

      setTimeout(() => {
        this.isMoving = false;
        this._store.dispatch(new fromStore.SliderPageClearMovement());
        this.markForCheck();
      }, 500);
    }
  }

  slideNext() {
    if (!this.blockNavigation) {
      this.isMoving = true;
      const activeIndex = this.sliderContent.nativeElement.swiper.activeIndex;

      if (this.slides[activeIndex].header?.component !== null) {
        this.componentsHeader?.toArray()[activeIndex].clear();
      }

      if (this.nextSlide.observers.length > 0) {
        this.nextSlide.emit({
          asset: this.sliderHeader.nativeElement.swiper,
          content: this.sliderContent.nativeElement.swiper,
        });
      } else {
        this.sliderHeader.nativeElement.swiper.slideNext(500);
        this.sliderContent.nativeElement.swiper.slideNext(500);
      }

      setTimeout(() => {
        this.isMoving = false;
        this._store.dispatch(new fromStore.SliderPageClearMovement());
        this.markForCheck();
      }, 500);
    }
  }

  slideTo(index: number) {
    console.log(`Attempting to slide to index ${index}`);

    // Check if swiper is initialized
    if (
      !this.sliderHeader?.nativeElement?.swiper ||
      !this.sliderContent?.nativeElement?.swiper
    ) {
      console.warn('Swiper not initialized yet, waiting...');

      // Workaround: Wait for swiper to initialize
      setTimeout(() => {
        this.slideTo(index);
      }, 100);
      return;
    }

    console.log(`Sliding to index ${index}`);
    this.sliderHeader.nativeElement.swiper.slideTo(index);
    this.sliderContent.nativeElement.swiper.slideTo(index);

    this.markForCheck();
  }

  trackBySlideFn(index: number, item: any) {
    return item?.header?.asset || index;
  }

  trackByCardFn(index: number, card: any) {
    return card?.title || card?.asset || index;
  }

  handlerEnterKey(event: any) {
    if (this.wrapper) {
      const field = event.target;
      const form = event.currentTarget.parentElement.parentElement;
      if (form.children.length > 1) {
        // if there more than 1 field
      } else {
        field.blur();
      }

      const actions = this.config.content?.isExpanded
        ? this.wrapper.nativeElement.querySelector(
            '.slider-page__content .wrapper-large .wrapper-large__toolbar-actions'
          )
        : this.wrapper.nativeElement.querySelector(
            '.slider-page__content .wrapper-small .swiper-slide-active .actions-wrapper'
          );

      if (actions) {
        const buttons = actions.children;
        if (buttons.length > 1) {
          buttons[buttons.length - 1].click();
        } else {
          buttons[0].click();
        }
      }
    }
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    if (!this._sanitizedContentCache) {
      this._sanitizedContentCache = new Map<string, SafeHtml>();
    }

    if (!this._sanitizedContentCache.has(htmlContent)) {
      this._sanitizedContentCache.set(
        htmlContent,
        this._sanitizer.bypassSecurityTrustHtml(htmlContent)
      );
    }

    return this._sanitizedContentCache.get(htmlContent)!;
  }

  private _loadComponent(element: ViewContainerRef, component: any) {
    if (!element) {
      console.error(
        'ViewContainerRef is undefined. Cannot load component:',
        component
      );
      return;
    }

    let componentRef;

    try {
      switch (component) {
        case 'welcome-doses-selector':
          componentRef = element.createComponent(
            fromWelcomeComponents.WelcomeDosesSelectorComponent
          );
          if (
            componentRef.instance instanceof
            fromWelcomeComponents.WelcomeDosesSelectorComponent
          ) {
            // Listen to the dosesSelected event
            componentRef.instance.onDosesChange.subscribe((doses: Date[]) => {
              // Handle the event in the parent component
              this._store.dispatch(
                new fromWelcomeStore.SetData({
                  doses: doses,
                })
              );
              this._store.dispatch(
                new fromHomeStore.SetData({
                  doses:
                    this.homeConfig?.doses?.map((dose: any, index: number) => {
                      return {
                        ...dose,
                        date: doses[index],
                      };
                    }) || [],
                })
              );
            });
          }
          break;
        case 'start-dose-prepare-temp-timer':
          componentRef = element.createComponent(
            fromHomeComponents.StartDosePrepareTempTimerComponent
          );
          break;
        case 'start-dose-prepare-setup':
          componentRef = element.createComponent(
            fromHomeComponents.StartDosePrepareSetupComponent
          );
          break;
        case 'start-dose-prepare-survey':
          componentRef = element.createComponent(
            fromHomeComponents.StartDosePrepareSurveyComponent
          );
          break;
        case 'start-dose-prepare-waiting-to-inject':
          componentRef = element.createComponent(
            fromHomeComponents.StartDosePrepareWaitingToInjectComponent
          );
          break;
        case 'start-dose-ready-to-inject-first-time-user':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseReadyToInjectFirstTimeUserComponent
          );
          if (
            componentRef.instance instanceof
            fromHomeComponents.StartDoseReadyToInjectFirstTimeUserComponent
          ) {
            componentRef.instance.onPlayTrainingVideo.subscribe(() => {
              this.slideNext();
            });
          }
          break;
        case 'start-dose-ready-to-inject-video':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseReadyToInjectVideoComponent
          );
          break;
        case 'start-dose-ready-to-inject-body-part-selector':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseReadyToInjectBodyPartSelectorComponent
          );
          break;
        case 'start-dose-ready-to-inject-waiting-to-start-injection':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseReadyToInjectWaitingToStartInjectionComponent
          );
          break;
        case 'start-dose-ready-to-inject-dosing':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseReadyToInjectDosingComponent
          );
          break;
        case 'start-dose-inject-done-progress':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseInjectDoneProgressComponent
          );
          break;
        case 'start-dose-inject-dose-notes':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseInjectDoseNotesFormComponent
          );
          break;
        case 'start-dose-inject-done-report':
          componentRef = element.createComponent(
            fromHomeComponents.StartDoseInjectDoneReportComponent
          );
          break;
        case 'add-symptom-form':
          componentRef = element.createComponent(
            fromCoreComponents.AddSymptomFormComponent
          );
          break;
        case 'calendar-doses':
          componentRef = element.createComponent(
            fromActivityComponents.CalendarDosesComponent
          );
          break;
        case 'calendar-edit-schedule':
          componentRef = element.createComponent(
            fromActivityComponents.CalendarEditScheduleComponent
          );
          break;
        default:
          console.warn('Unknown component:', component);
          break;
      }
    } catch (error) {
      console.error('Error loading component:', component, error);
    }
  }

  private markForCheck() {
    console.log('[SliderPageComponent]: markForCheck');
    this._cdr.markForCheck();
  }

  private async initializeSwipers() {
    if (this.slides.length === 0) {
      console.warn('No slides to initialize');
      return;
    }

    try {
      console.log('Waiting for swiper custom elements to be defined...');
      await customElements.whenDefined('swiper-container');
      console.log('Swiper custom elements defined');

      this.onSliderInit();

      const headerSwiperEl = this.sliderHeader.nativeElement;
      const contentSwiperEl = this.sliderContent.nativeElement;

      // Set up parameters before initialization
      headerSwiperEl.setAttribute('effect', 'fade');
      headerSwiperEl.setAttribute('lazy', 'false');
      applySwiperNoTouchAttributes(headerSwiperEl);

      // Update content swiper attributes
      contentSwiperEl.setAttribute('effect', 'fade');
      contentSwiperEl.setAttribute('pagination', 'true');
      contentSwiperEl.setAttribute('pagination-clickable', 'true');
      contentSwiperEl.setAttribute('pagination-el', '.swiper-pagination');
      applySwiperNoTouchAttributes(contentSwiperEl);

      const headerParams = {
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        ...SWIPER_NO_TOUCH_CONFIG,
        speed: 500,
        modules: [EffectFade],
        lazy: false,
      };

      const contentParams = {
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        ...SWIPER_NO_TOUCH_CONFIG,
        speed: 500,
        modules: [EffectFade, Pagination],
        pagination: {
          el: '.swiper-pagination',
          clickable: false,
          type: 'bullets',
          bulletActiveClass: 'swiper-pagination-bullet-active',
          bulletClass: 'swiper-pagination-bullet',
        },
      };

      Object.assign(headerSwiperEl, { params: headerParams });
      Object.assign(contentSwiperEl, { params: contentParams });

      // Add event listeners
      headerSwiperEl.addEventListener('swiperready', () => {
        console.log('Header Swiper is ready!');
        this.markForCheck();
      });

      contentSwiperEl.addEventListener('swiperready', () => {
        console.log('Content Swiper is ready!');
        this.markForCheck();
      });

      contentSwiperEl.addEventListener('swiperslidechange', () => {
        console.log('Slide changed!');
        this.onSlideChange();
      });

      // Initialize Swipers
      console.log('Initializing swipers...');
      headerSwiperEl.initialize();
      contentSwiperEl.initialize();

      // Emit an event when both swipers are ready
      let headerReady = false;
      let contentReady = false;

      headerSwiperEl.addEventListener('swiperready', () => {
        headerReady = true;
        if (headerReady && contentReady) {
          console.log('Both swipers are ready!');
          this.markForCheck();
        }
      });

      contentSwiperEl.addEventListener('swiperready', (event: any) => {
        contentReady = true;
        console.log('Content Swiper Ready:', event);
        console.log('Pagination:', contentSwiperEl.swiper.pagination);

        if (headerReady && contentReady) {
          console.log('Both swipers are ready!');
          this.markForCheck();
        }
      });
    } catch (error) {
      console.error('Error initializing swipers:', error);
    }
  }
}
