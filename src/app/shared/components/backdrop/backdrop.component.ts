import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { animate, spring } from 'motion';
import { register } from 'swiper/element/bundle';
import { EffectFade } from 'swiper/modules';

// Register Swiper custom elements
register();

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DynamicInnerHtmlDirective,
  ThreeFingerTapDirective,
} from '@app/shared/directives';
import { BluetoothService } from '@app/shared/libs/bluetooth';
import * as fromCoreStore from '@core/store';
import * as fromHomeComponents from '@home/components';
import * as fromHomeStore from '@home/store';
import { IonButton, IonIcon, IonImg } from '@ionic/angular/standalone';
import { BatteryIndicatorComponent, CardComponent } from '@shared/components';
import * as fromBluetoothStore from '@shared/libs/bluetooth/store';
import * as fromSharedServices from '@shared/services';
import * as fromStore from '@shared/store';
import * as fromWelcomeComponents from '@welcome/components';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
  chevronUpOutline,
  closeOutline,
  constructOutline,
  warningOutline,
} from 'ionicons/icons';
import type { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'automagic-backdrop',
  templateUrl: 'backdrop.component.html',
  styleUrls: ['backdrop.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ThreeFingerTapDirective,
    DynamicInnerHtmlDirective,
    CardComponent,
    IonButton,
    IonImg,
    IonIcon,
    BatteryIndicatorComponent,
  ],
})
export class BackdropComponent implements OnInit, AfterViewInit {
  public config$ = this._store.select(fromStore.getBackdropConfig);
  public layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  public isConnected$ = this._store.select(fromBluetoothStore.getIsConnected);
  public batteryLevel$ = this._store.select(fromBluetoothStore.getBatteryLevel);
  public homeConfig$ = this._store.select(fromHomeStore.getHomeConfig);
  public config: any;
  public layoutConfig: any;
  public homeConfig: any;
  public backButton!: any;
  public initialized: boolean = false;
  public isShowDebugging: boolean = false;
  public isShowDebuggingStatus: boolean = false;
  public initialSlide: number = 0;
  public foldBackgroundImage: string = '/assets/images/backdrop-fold-bg.svg';
  @ViewChild('sliderMainMenu') sliderMainMenu!: ElementRef<SwiperContainer>;
  @ViewChild('sliderHighlightsTour')
  sliderHighlightsTour!: ElementRef<SwiperContainer>;
  @ViewChild('sliderShareFlow') sliderShareFlow!: ElementRef<SwiperContainer>;
  @ViewChild('sliderReturnFlow') sliderReturnFlow!: ElementRef<SwiperContainer>;
  @ViewChild('contentComponent', { read: ViewContainerRef })
  contentComponent!: ViewContainerRef;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _sanitizer: DomSanitizer,
    private _utils: fromSharedServices.UtilsService,
    private _bluetoothService: BluetoothService
  ) {
    addIcons({
      chevronBackOutline,
      warningOutline,
      constructOutline,
      chevronForwardOutline,
      chevronUpOutline,
      closeOutline,
    });
  }

  getType(): string {
    let type = '';
    if (this.config.highlights) {
      type = 'highlights-tour';
    } else if (this.config.returnFlow) {
      type = 'return-flow';
    } else if (this.config.shareFlow) {
      type = 'share-flow';
    } else {
      if (!this.config.template && !this.config.component) {
        type = 'menu-main';
      } else {
        type = 'dinamic';
      }
    }
    return type;
  }

  ngOnInit() {
    this.config$.subscribe((config) => {
      if (config) {
        this.config = config;
        if (this.config.show) {
          if (this.config.component !== null) {
            this._loadComponent(this.config.component);
          } else {
            this.contentComponent?.clear();
          }

          if (this.config.onHighlightsTourInit) {
            this.onHighlightsTourInit();
          }

          if (this.getType() === 'dinamic') {
            if (this.config.showBackButton) {
              this.setGoBackMenuButton();
            }
          }
        } else {
          // wait until close totally backdrop
          if (this.initialized) {
            setTimeout(() => {
              this.contentComponent?.clear();
              this.goToSubmenu(0);
            }, 800);
          }
        }

        if (!this.config.initialSlide || this.initialSlide > 0) {
          this.initialSlide = 0;
        }
      }
    });

    this.layoutConfig$.subscribe((layoutConfig) => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;

        this.isShowDebuggingStatus =
          layoutConfig.noDeviceMode ||
          layoutConfig.noDeviceModeOopsFlow ||
          layoutConfig.noDeviceModeBatteryLowFlow ||
          layoutConfig.debuggingDeviceMode;

        this.foldBackgroundImage = this.getFoldBackgroundImage();
      }
    });

    this.homeConfig$.subscribe((homeConfig) => {
      if (homeConfig) {
        this.homeConfig = homeConfig;
      }
    });
  }

  ngAfterViewInit() {
    this.initialized = true;
    this.initializeSwipers();
  }

  private async initializeSwipers() {
    await customElements.whenDefined('swiper-container');

    // Initialize all swipers
    const swipers = [
      this.sliderMainMenu?.nativeElement,
      this.sliderHighlightsTour?.nativeElement,
      this.sliderShareFlow?.nativeElement,
      this.sliderReturnFlow?.nativeElement,
    ].filter((swiper) => swiper) as SwiperContainer[]; // Cast to correct type

    for (const swiperEl of swipers) {
      // Configure each swiper
      Object.assign(swiperEl, {
        modules: [EffectFade],
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        allowTouchMove: false,
        speed: 500,
      });

      // Initialize swiper
      await swiperEl.initialize();
    }
  }

  toggle() {
    if (!this.config.show) {
      if (!this.homeConfig.dosingStarted) {
        this._store.dispatch(
          new fromStore.BackdropShow({
            transition: 'move',
            header: true,
          })
        );
      }
    } else {
      if (!this.config.blockClose) {
        this._store.dispatch(new fromStore.BackdropHide());
      }
    }
  }

  onMenuInit() {
    if (this.config.showBackButton) {
      this.backButton = null;
      if (this.initialSlide > 0) {
        this.backButton = {
          label: 'Back',
          action: () => {
            this.goToSlideZero();
          },
        };
      }
    }
  }

  onMenuChange() {
    if (
      this.sliderMainMenu &&
      this.sliderMainMenu.nativeElement.swiper.activeIndex > 0
    ) {
      if (this.config.showBackButton) {
        this.backButton = {
          label: 'Back',
          action: () => {
            this.goToSlideZero();
          },
        };
      }
    }
  }

  goToSubmenu(step: number) {
    if (this.sliderMainMenu) {
      this.sliderMainMenu.nativeElement.swiper.slideTo(step);
    }

    if (
      this.sliderHighlightsTour &&
      this.sliderHighlightsTour.nativeElement.swiper.slides[step]
    ) {
      this.sliderHighlightsTour.nativeElement.swiper.slideTo(step);
    }
  }

  showDebugging = () => {
    if (this.sliderMainMenu) {
      this.isShowDebugging = true;
      this.sliderMainMenu.nativeElement.swiper.slideTo(4);
    }
  };

  goBackToMenu(stepToGo?: number) {
    if (this.config.fullScreen) {
      this.animateFullScreenToDefault();
    }

    this.backButton = null;
    this.contentComponent?.clear();
    this._store.dispatch(
      new fromStore.BackdropSetConfig({
        transition: 'move',
        header: true,
        bgTemplate: this.config.bgTemplate ? null : null,
        fullScreen: this.config.fullScreen ? false : null,
        template: null,
        component: null,
        highlights: null,
        returnFlow: null,
        shareFlow: null,
      })
    );

    if (stepToGo) {
      this.initialSlide = stepToGo;
    }
  }

  onBackToMenu(): void {
    this.isShowDebugging = false;
    this.goToSlideZero();
  }

  setGoBackMenuButton() {
    this.backButton = {
      label: 'Menu',
      action: () => {
        this.goBackToMenu();
      },
    };
  }

  getPercentageBatteryAsset(battery: number) {
    let percentage = 100;
    if (battery > 50 && battery <= 75) {
      percentage = 75;
    } else if (battery > 25 && battery <= 50) {
      percentage = 50;
    } else if (battery > 5 && battery <= 25) {
      percentage = 25;
    } else if (battery <= 5) {
      percentage = 5;
    } else if (battery === 0) {
      percentage = 0;
    }
    return percentage.toString();
  }

  onHighlightsTourInit() {
    if (this.config.showBackButton) {
      this.backButton = {
        label: 'Back',
        action: () => {
          if (this.config.fullScreen) {
            this.animateFullScreenToDefault();
          }

          this._store.dispatch(
            new fromStore.BackdropSetConfig({
              transition: 'move',
              header: true,
              fullScreen: false,
              component: 'start-guided-demo',
              contentCentered: true,
              highlights: null,
            })
          );
        },
      };
    }

    const wrapper =
      this.sliderHighlightsTour?.nativeElement.swiper.slides[0].querySelector(
        '.masonry-layout'
      );
    if (wrapper) {
      this._utils.createMasonryLayout(wrapper);
    }
  }

  onHighlightsTourChange() {
    const activeIndex =
      this.sliderHighlightsTour.nativeElement.swiper.activeIndex;
    if (activeIndex > 0) {
      if (this.config.showBackButton) {
        this.backButton = {
          label: 'Back',
          action: () => {
            this.sliderHighlightsTour.nativeElement.swiper.slideTo(0);
          },
        };
      }
    } else if (activeIndex === 0) {
      this.backButton = {
        label: 'Back',
        action: () => {
          if (this.config.fullScreen) {
            this.animateFullScreenToDefault();
          }

          this._store.dispatch(
            new fromStore.BackdropSetConfig({
              transition: 'move',
              header: true,
              fullScreen: false,
              component: 'start-guided-demo',
              contentCentered: true,
              highlights: null,
              showBackButton: false,
            })
          );
        },
      };
    }
  }

  showShareFlow() {
    const element = document.querySelector(
      '#backdrop .backdrop__wrapper'
    ) as HTMLElement;
    element.style.removeProperty('height');

    this._store.dispatch(
      new fromStore.BackdropSetConfig({
        shareFlow: true,
        returnFlow: null,
        contentCentered: null,
      })
    );

    if (this.config.showBackButton) {
      this.backButton = {
        label: 'Back',
        action: () => {
          this._store.dispatch(
            new fromStore.BackdropSetConfig({
              shareFlow: null,
            })
          );
          this.initialSlide = 1;
        },
      };
    }
  }

  slideNextShareFlow(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.sliderShareFlow.nativeElement.swiper.slideNext();
  }

  showReturnFlow() {
    this._store.dispatch(
      new fromStore.BackdropSetConfig({
        returnFlow: true,
        shareFlow: null,
        contentCentered: null,
      })
    );

    if (this.config.showBackButton) {
      this.backButton = {
        label: 'Back',
        action: () => {
          this._store.dispatch(
            new fromStore.BackdropSetConfig({
              returnFlow: null,
            })
          );
          this.initialSlide = 1;
        },
      };
    }
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  animateFullScreenToDefault() {
    if (this.config.transition === 'fade') {
      animate(
        '#backdrop',
        { opacity: 1 },
        {
          easing: 'ease-in-out',
          duration: 0.2,
        }
      );
    }

    animate(
      '#backdrop .backdrop__wrapper',
      {
        height: [
          `${window.innerHeight}px`,
          `${window.innerHeight * 0.9}px`,
          `${window.innerHeight * 0.8}px`,
          `${window.innerHeight * 0.75}px`,
        ],
      },
      {
        easing: spring({
          stiffness: 100,
          damping: 15,
          mass: 1,
          velocity: 800,
        }),
      }
    );
  }

  doAnotherInjection() {
    this._store.dispatch(
      new fromHomeStore.SetData({
        firstTimeDose: false,
        doses: this.homeConfig.doses.map((dose: any, index: number) => {
          return {
            marked: index === 0 ? dose.marked : false,
            date: dose.date,
            bodyPartInjected: index === 0 ? dose.bodyPartInjected : '',
            notes: index === 0 ? dose.notes : null,
          };
        }),
        timeTravelingDemoDone: true,
        flareUpsDemoDone: true,
        allCompletedDoses: false,
      })
    );
    this.toggle();
    this.goTo('home/start-dose/prepare');
  }

  resetApp() {
    this._store.dispatch(new fromCoreStore.ClearStore());
    this.toggle();
    this.goTo('welcome');
    setTimeout(() => window.location.reload());
  }

  toggleDebuggingOptions(option: string) {
    switch (option) {
      case 'no-device-mode':
        this._store.dispatch(
          new fromCoreStore.SetNoDeviceMode(!this.layoutConfig.noDeviceMode)
        );
        break;
      case 'oops-flow':
        if (this.layoutConfig.noDeviceMode) {
          this._store.dispatch(
            new fromCoreStore.SetNoDeviceModeOopsFlow(
              !this.layoutConfig.noDeviceModeOopsFlow
            )
          );
        }
        break;
      case 'battery-low':
        if (this.layoutConfig.noDeviceMode) {
          this._store.dispatch(
            new fromCoreStore.SetNoDeviceModeBatteryLowFlow(
              !this.layoutConfig.noDeviceModeBatteryLowFlow
            )
          );
          this._bluetoothService.setBattery(5);
        }
        break;
      case 'device-debugging':
        this._store.dispatch(
          new fromCoreStore.SetDeviceDebugging(
            !this.layoutConfig.debuggingDeviceMode
          )
        );
        break;
    }
  }

  goTo(path: string) {
    this._store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }

  getModelDeviceNumber(model: any) {
    model = model.replaceAll(/[a-z]/g, '');
    return Number(model);
  }

  getFoldBackgroundImage(): string {
    if (!this.layoutConfig.userDevice) {
      return '/assets/images/backdrop-fold-bg.svg';
    }

    const model = this.layoutConfig.userDevice.model;
    const modelNumber = this.getModelDeviceNumber(model);

    if (modelNumber < 10.5) {
      return '/assets/images/backdrop-fold-bg--iphone-8.png';
    }

    if (model === 'iphone10.6') {
      return '/assets/images/backdrop-fold-bg--iphone-x.svg';
    }

    if (
      [
        'iphone12.1',
        'iphone12.2',
        'iphone12.3',
        'iphone12.4',
        'iphone12.5',
      ].includes(model)
    ) {
      return '/assets/images/backdrop-fold-bg--iphone-11.svg';
    }

    if (
      [
        'iphone13.1',
        'iphone13.2',
        'iphone13.3',
        'iphone13.4',
        'iphone13.5',
      ].includes(model)
    ) {
      return '/assets/images/backdrop-fold-bg--iphone-12.png';
    }

    if (
      [
        'iphone14.1',
        'iphone14.2',
        'iphone14.3',
        'iphone14.4',
        'iphone14.5',
      ].includes(model)
    ) {
      return '/assets/images/backdrop-fold-bg--iphone-13.svg';
    }

    if (['iphone14.7', 'iphone14.8'].includes(model)) {
      return '/assets/images/backdrop-fold-bg--iphone-14.svg';
    }

    if (['iphone15.2', 'iphone15.3'].includes(model)) {
      return '/assets/images/backdrop-fold-bg--iphone-14-pro.svg';
    }

    return '/assets/images/backdrop-fold-bg--iphone.svg';
  }

  private _loadComponent(component: any) {
    this.contentComponent.clear();
    switch (component) {
      case 'welcome-sign-up':
        this.contentComponent.createComponent(
          fromWelcomeComponents.WelcomeSignUpComponent
        );
        break;
      case 'start-guided-demo':
        this.contentComponent.createComponent(
          fromHomeComponents.StartGuidedDemoComponent
        );
        break;
      case 'time-traveling':
        this.contentComponent.createComponent(
          fromHomeComponents.TimeTravelingComponent
        );
        break;
    }
  }
  private goToSlideZero(): void {
    this.sliderMainMenu.nativeElement.swiper.slideTo(0);
    this.backButton = null;
  }
}
