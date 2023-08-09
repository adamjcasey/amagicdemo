import { 
  Component, 
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ViewContainerRef,
  AfterViewInit
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { animate, spring } from 'motion';
import { SwiperComponent } from 'swiper/angular';

// Swiper Config
import SwiperCore, { EffectFade } from 'swiper';
SwiperCore.use([EffectFade]);

import * as fromStore from '@shared/store';
import * as fromCoreStore from '@core/store';
import * as fromSharedServices from '@shared/services';
import * as fromWelcomeComponents from '@welcome/components';
import * as fromHomeComponents from '@home/components';

@Component({
  selector: 'automagic-backdrop',
  templateUrl: 'backdrop.component.html',
  styleUrls: ['backdrop.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BackdropComponent implements OnInit, AfterViewInit {
  public config$: Observable<any>;
  public config: any;
  public layoutConfig$: Observable<any>;
  public layoutConfig: any;
  public backButton!: any;
  public initialized: boolean = false;
  public initialSlide: number = 0;
  public batteryLevel: number = 0;
  @ViewChild('sliderMainMenu', { static: false }) sliderMainMenu!: SwiperComponent;
  @ViewChild('sliderHighlightsTour', { static: false }) sliderHighlightsTour!: SwiperComponent;
  @ViewChild('sliderShareFlow', { static: false }) sliderShareFlow!: SwiperComponent;
  @ViewChild('contentComponent', { read: ViewContainerRef }) contentComponent!: ViewContainerRef;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
    private _sanitizer: DomSanitizer,
    private _utils: fromSharedServices.UtilsService,
    private _bluetoothService: fromSharedServices.BluetoothService,
  ) {
    this.config$ = this._store.select(fromStore.getBackdropConfig);
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  }

  getType(): string {
    let type = '';
    if (this.config.highlights) {
      type = 'highlights-tour';
    }
    else if (this.config.returnFlow) {
      type = 'return-flow';
    }
    else if (this.config.shareFlow) {
      type = 'share-flow';
    }
    else {
      if (!this.config.template && !this.config.component) {
        type = 'menu-main';
      }
      else {
        type = 'dinamic';
      }
    }
    return type;
  }

  ngOnInit() {
    this.config$.subscribe(config => {
      if (config) {
        this.config = config;
        if (this.config.show) {
          if (this.config.component !== null) {
            this._loadComponent(this.config.component);
          }
          else {
            this.contentComponent?.clear();
          }

          if (this.getType() === 'dinamic') {
            if (this.config.showBackButton) {
              this.setGoBackMenuButton();
            }
          }
        }
        else {
          // wait until close totally backdrop
          if (this.initialized) {
            setTimeout(() => {
              this.contentComponent?.clear();
              if (this.getType() === 'main-menu') {
                this.goToSubmenu(0);
              }
            }, 800);
          }
        }

        if (!this.config.initialSlide || this.initialSlide > 0) {
          this.initialSlide = 0;
        }
      }
    });

    this.layoutConfig$.subscribe(layoutConfig => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
      }
    });
  }

  ngAfterViewInit() {
    this.initialized = true;
  }

  toggle() {
    if (!this.config.show) {
      this._store.dispatch(new fromStore.BackdropShow({
        transition: 'move',
        header: true,
      }));
    }
    else {
      this._store.dispatch(new fromStore.BackdropHide);
    }
  }

  onMenuInit() {
    this.getBatteryLevel();
    if (this.config.showBackButton) {
      this.backButton = null;
    }
  }

  onMenuChange() {
    if (this.sliderMainMenu && this.sliderMainMenu.swiperRef.activeIndex > 0) {
      if (this.config.showBackButton) {
        this.backButton = {
          label: 'Back',
          action: () => {
            this.sliderMainMenu.swiperRef.slideTo(0);
            this.backButton = null;
          }
        };
      }
    }
  }

  goToSubmenu(step: number) {
    if (this.sliderMainMenu) {
      this.sliderMainMenu?.swiperRef.slideTo(step);
    }

    if (this.sliderHighlightsTour) {
      this.sliderHighlightsTour?.swiperRef.slideTo(step);
    }
  }

  goBackToMenu() {
    if (this.config.fullScreen) {
      this.animateFullScreenToDefault();
    }

    this.backButton = null;
    this.contentComponent?.clear();
    this._store.dispatch(new fromStore.BackdropSetConfig({
      transition: 'move',
      header: true,
      bgTemplate: this.config.bgTemplate ? null : null,
      fullScreen: this.config.fullScreen ? false : null,
      template: null,
      component: null,
    }));
  }

  setGoBackMenuButton() {
    this.backButton = {
      label: 'Menu',
      action: () => {
        this.goBackToMenu();
      }
    }
  }

  onHighlightsTourInit() {
    if (this.config.showBackButton) {
      this.backButton = {
        label: 'Back',
        action: () => {
          if (this.config.fullScreen) {
            this.animateFullScreenToDefault();
          }

          this._store.dispatch(new fromStore.BackdropSetConfig({
            transition: 'move',
            header: true,
            fullScreen: false,
            component: 'start-guided-demo',
            contentCentered: true,
            highlights: null,
          }));
        }
      };
    }

    const wrapper = this.sliderHighlightsTour.swiperRef.slides[0].querySelector('.masonry-layout');
    if (wrapper) {
      this._utils.createMasonryLayout(wrapper);
    }
  }

  onHighlightsTourChange() {
    const activeIndex = this.sliderHighlightsTour.swiperRef.activeIndex;
    if (activeIndex > 0) {
      if (this.config.showBackButton) {
        this.backButton = {
          label: 'Back',
          action: () => {
            this.sliderHighlightsTour.swiperRef.slideTo(0);
          }
        };
      }
    }
    else if (activeIndex === 0) {
      this.backButton = {
        label: 'Back',
        action: () => {
          if (this.config.fullScreen) {
            this.animateFullScreenToDefault();
          }

          this._store.dispatch(new fromStore.BackdropSetConfig({
            transition: 'move',
            header: true,
            fullScreen: false,
            component: 'start-guided-demo',
            contentCentered: true,
            highlights: null,
          }));
        }
      };
    }
  }

  showShareFlow() {
    const element = document.querySelector('#backdrop .backdrop__wrapper') as HTMLElement;
    element.style.removeProperty('height');

    this._store.dispatch(new fromStore.BackdropSetConfig({
      shareFlow: true,
      returnFlow: null,
      contentCentered: null,
    }));

    if (this.config.showBackButton) {
      this.backButton = {
        label: 'Back',
        action: () => {
          this._store.dispatch(new fromStore.BackdropSetConfig({
            shareFlow: null,
          }));
          this.initialSlide = 1;
        }
      };
    }
  }

  slideNextShareFlow(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.sliderShareFlow.swiperRef.slideNext();
  }

  showReturnFlow() {
    this._store.dispatch(new fromStore.BackdropSetConfig({
      returnFlow: true,
      shareFlow: null,
      contentCentered: null,
    }));

    if (this.config.showBackButton) {
      this.backButton = {
        label: 'Back',
        action: () => {
          this._store.dispatch(new fromStore.BackdropSetConfig({
            returnFlow: null,
          }));
          this.initialSlide = 1;
        }
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
        },
      );
    }

    animate(
      '#backdrop .backdrop__wrapper',
      { height: [
          `${window.innerHeight}px`,
          `${(window.innerHeight) * 0.9}px`,
          `${(window.innerHeight) * 0.8}px`,
          `${(window.innerHeight) * 0.75}px`,
      ] },
      { easing: spring({
        stiffness: 100,
        damping: 15,
        mass: 1,
        velocity: 800,
      }) }
    );
  }

  getBatteryLevel() {
    this.batteryLevel = this._bluetoothService.Battery;
  }

  toggleNoDeviceMode() {
    this._store.dispatch(new fromCoreStore.SetNoDeviceMode(!this.layoutConfig.noDeviceMode));
  }

  toggleNoDeviceOopsFlow() {
    if (this.layoutConfig.noDeviceMode) {
      this._store.dispatch(new fromCoreStore.SetNoDeviceModeOopsFlow(!this.layoutConfig.noDeviceModeOopsFlow));
    }
  }

  toggleNoDeviceBatteryLowFlow() {
    if (this.layoutConfig.noDeviceMode) {
      this._store.dispatch(new fromCoreStore.SetNoDeviceModeBatteryLowFlow(!this.layoutConfig.noDeviceModeBatteryLowFlow));
      this._bluetoothService.Battery = 5;
    }
  }

  private _loadComponent(component: any) {
    this.contentComponent.clear();
    switch(component) {
      case 'welcome-sign-up':
        this.contentComponent.createComponent(fromWelcomeComponents.WelcomeSignUpComponent);
        break;
      case 'start-guided-demo':
        this.contentComponent.createComponent(fromHomeComponents.StartGuidedDemoComponent);
        break;
      case 'time-traveling':
        this.contentComponent.createComponent(fromHomeComponents.TimeTravelingComponent);
        break;
    }
  }
}
