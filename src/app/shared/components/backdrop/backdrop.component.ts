import { 
  Component, 
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ViewContainerRef
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { animate, spring } from 'motion';
import { SwiperComponent } from 'swiper/angular';

// Swiper Config
import SwiperCore, { EffectFade } from 'swiper';
SwiperCore.use([EffectFade]);

import { WelcomeSignUpComponent } from '@welcome/components';
import * as fromStore from '@shared/store';
import * as fromSharedServices from '@shared/services';

@Component({
  selector: 'automagic-backdrop',
  templateUrl: 'backdrop.component.html',
  styleUrls: ['backdrop.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BackdropComponent implements OnInit {
  public config$: Observable<any>;
  public config: any;
  public backButton!: any;
  @ViewChild('sliderMainMenu', { static: false }) sliderMainMenu!: SwiperComponent;
  @ViewChild('sliderHighlights', { static: false }) sliderHighlights!: SwiperComponent;
  @ViewChild('contentComponent', { read: ViewContainerRef }) contentComponent!: ViewContainerRef;

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _sanitizer: DomSanitizer,
    private _utils: fromSharedServices.UtilsService
  ) {
    this.config$ = this._store.select(fromStore.getBackdropConfig);
  }

  getType(): string {
    let type = '';
    if (this.config.hightlights) {
      type = 'hightlights-menu';
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
              this.goBackToMenu();
            }
          }
        }
        else {
          // wait until close totally backdrop
          setTimeout(() => {
            this.contentComponent?.clear();
            if (this.getType()) {
              this.goToSubmenu(0);
            }

            if (typeof this.config.onClose === 'function') {
              this.config.onClose();
            }
          }, 800);
        }
      }
    });

    window.backdropComponent = {
      close: () => {
        this._store.dispatch(new fromStore.BackdropClose());
      },
    }
  }

  toggle() {
    if (!this.config.show) {
      this._store.dispatch(new fromStore.BackdropShow({
        transition: 'move',
        header: true,
      }));
    }
    else {
      this._store.dispatch(new fromStore.BackdropClose);
    }
  }

  onMenuInit() {
    if (this.config.showBackButton) {
      this.backButton = null;
    }
  }

  onMenuChange() {
    if (this.sliderMainMenu.swiperRef.activeIndex > 0) {
      if (this.config.showBackButton) {
        console.log('pone back onMenuChange');
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

  goBackToMenu() {
    this.backButton = {
      label: 'Menu',
      action: () => {
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
          hightlights: null,
        }));
      }
    }
  }

  onHighlightsInit() {
    if (this.config.showBackButton) {
      this.goBackToMenu();
    }

    const wrapper = this.sliderHighlights.swiperRef.slides[0].querySelector('.masonry-layout');
    if (wrapper) {
      this._utils.createMasonryLayout(wrapper);
    }
  }

  onHighlightsChange() {
    const activeIndex = this.sliderHighlights.swiperRef.activeIndex;
    if (activeIndex > 0) {
      if (this.config.showBackButton) {
        this.backButton = {
          label: 'Back',
          action: () => {
            this.sliderHighlights.swiperRef.slideTo(0);
          }
        };
      }
    }
    else if (activeIndex === 0) {
      this.goBackToMenu();
    }
  }

  goToSubmenu(step: number) {
    if (this.sliderMainMenu) {
      this.sliderMainMenu?.swiperRef.slideTo(step);
    }

    if (this.sliderHighlights) {
      this.sliderHighlights?.swiperRef.slideTo(step);
    }
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  animateFullScreenToDefault() {
    animate(
      "#backdrop",
      {
        height: [
          `${window.innerHeight}px`,
          `${window.innerHeight * 0.9}px`,
          `${window.innerHeight * 0.8}px`,
          `${window.innerHeight * 0.75}px`
        ], 
        opacity: this.config.transition === 'fade' ? 1 : ''
      },
      { easing: spring({
        stiffness: 100,
        damping: 15,
        mass: 1,
        velocity: 800,
      }) }
    );
  }

  animateDefaultToFullScreen() {
    animate(
      "#backdrop",
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

  private _loadComponent(component: any) {
    this.contentComponent.clear();
    switch(component) {
      case 'welcome-sign-up':
        this.contentComponent.createComponent(WelcomeSignUpComponent);
        break;
    }
  }
}
