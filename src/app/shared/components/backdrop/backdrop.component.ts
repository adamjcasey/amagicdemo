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

import { WelcomeSignUpComponent, WelcomeDosesSelectorComponent } from '@welcome/components';
import * as fromStore from '@shared/store';

@Component({
  selector: 'automagic-backdrop',
  templateUrl: 'backdrop.component.html',
  styleUrls: ['backdrop.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BackdropComponent implements OnInit {
  public config$: Observable<any>;
  public config: any;
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
        }
        else {
          this.contentComponent?.clear();
          if (this.isContentEmpty()) {
            this.showSubmenu(0);
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

  showSubmenu(step: number) {
    this.sliderMainMenu?.swiperRef.slideTo(step);
    
    if (this.sliderMainMenu?.swiperRef.activeIndex > 0) {
      this._store.dispatch(new fromStore.BackdropSetConfig({
        backButton: {
          label: 'Back',
          action: () => {
            this.sliderMainMenu?.swiperRef.slideTo(0);
            this._store.dispatch(new fromStore.BackdropSetConfig({
              backButton: null,
            }));
          }
        },
      }));
    }
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
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
