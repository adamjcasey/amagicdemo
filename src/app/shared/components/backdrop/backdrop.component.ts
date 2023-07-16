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
import { SwiperComponent } from 'swiper/angular';

// Swiper Config
import SwiperCore, { EffectFade } from 'swiper';
SwiperCore.use([EffectFade]);

import { WelcomeSignUpComponent } from '@welcome/components';
import * as fromStore from '@shared/store';
import { animate, spring } from 'motion';

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
  @ViewChild('contentComponent', { read: ViewContainerRef }) contentComponent!: ViewContainerRef;

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _sanitizer: DomSanitizer,
  ) {
    this.config$ = this._store.select(fromStore.getBackdropConfig);
  }

  isContentEmpty(): boolean {
    return !this.config.template && !this.config.component;
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

          if (!this.isContentEmpty()) {
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
                }));
              }
            }
          }
        }
        else {
          this.contentComponent?.clear();
          if (this.isContentEmpty()) {
            this.goToSubmenu(0);
          }

          if (typeof this.config.onClose === 'function') {
            this.config.onClose();
          }
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

  goToSubmenu(step: number) {
    this.sliderMainMenu?.swiperRef.slideTo(step);
    
    if (this.sliderMainMenu?.swiperRef.activeIndex > 0) {
      this.backButton = {
        label: 'Back',
        action: () => {
          this.sliderMainMenu.swiperRef.slideTo(0);
          this.backButton = null;
        }
      };
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

  private _loadComponent(component: any) {
    this.contentComponent.clear();
    switch(component) {
      case 'welcome-sign-up':
        this.contentComponent.createComponent(WelcomeSignUpComponent);
        break;
    }
  }
}
