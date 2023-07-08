import {
  Component,
  ViewChild,
  ViewEncapsulation,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterContentInit,
  ViewContainerRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// Swiper Config
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination, EffectFade } from 'swiper';
SwiperCore.use([Pagination, EffectFade]);

import * as fromStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';
import * as fromWelcomeComponents from '@welcome/components';
import * as fromHomeComponents from '@home/components';

@Component({
  selector: 'automagic-slider-page',
  templateUrl: 'slider-page.component.html',
  styleUrls: ['slider-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SliderPageComponent implements OnInit, AfterContentInit {
  @Input() slides!: Array<any>;
  @Output() onContentInit = new EventEmitter<any>();
  @Output() onPrevSlide = new EventEmitter<any>();
  @Output() onNextSlide = new EventEmitter<any>();
  @ViewChild('sliderAsset', { static: false }) sliderAsset!: SwiperComponent;
  @ViewChild('sliderContent', { static: false }) sliderContent!: SwiperComponent;
  @ViewChild('contentComponent', { read: ViewContainerRef }) contentComponent!: ViewContainerRef;
  public config$: Observable<any>;
  public config: any;
  public currentSlide: any;

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _sanitizer: DomSanitizer,
  ) {
    this.config$ = this._store.select(fromStore.getSliderPageConfig);
  }

  ngOnInit() {
    this.currentSlide = this.slides[0];
    this.config$.subscribe(config => {
      if (config) {
        if (config.content.isExpanded) {
          // if the most recent config don't have a configured component
          // clean up content component element
          if (config.content.component === null) {
            this.contentComponent?.clear();
          }
          else {
            // if the one step back config don't have a configured component
            // load the component of the most recent config
            if (this.config.content.component === null) {
              this._loadComponent(config.content.component);
            }
            else {
              // If in both configs there is a configured component, 
              // validate if they are different component, if they 
              // are different load the component on the most recent config
              if (config.content.component !== this.config.content.component) {
                this._loadComponent(config.content.component);  
              }
            }
          }
        }
        this.config = config;
      }
    });
  }

  ngAfterContentInit() {
    this.onContentInit.emit();
  }

  slidePrev() {
    if (this.onPrevSlide.observers.length > 0) {
      this.onPrevSlide.emit({
        asset: this.sliderAsset.swiperRef,
        content: this.sliderContent.swiperRef,
      })
    }
    else {
      this.sliderAsset.swiperRef.slidePrev(500);
      this.sliderContent.swiperRef.slidePrev(500);
    }
  }

  slideNext() {
    if (this.onNextSlide.observers.length > 0) {
      this.onNextSlide.emit({
        asset: this.sliderAsset.swiperRef,
        content: this.sliderContent.swiperRef,
      })
    }
    else {
      this.sliderAsset.swiperRef.slideNext(500);
      this.sliderContent.swiperRef.slideNext(500);
    }
  }

  slideChange() {
    this.currentSlide = this.slides[this.sliderContent.swiperRef.activeIndex];
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  private _loadComponent(component: any) {
    // clear template before loading a new component
    this.contentComponent?.clear();
    let componentRef;
    switch(component) {
      case 'welcome-doses-selector':
        componentRef = this.contentComponent.createComponent(fromWelcomeComponents.WelcomeDosesSelectorComponent);
        if (componentRef.instance instanceof fromWelcomeComponents.WelcomeDosesSelectorComponent) {
          // Listen to the dosesSelected event
          componentRef.instance.onDosesChange.subscribe((doses: number) => {
            // Handle the event in the parent component
            this._store.dispatch(new fromWelcomeStore.SetData({
              doses: doses,
            }));
          });
        }
        break;
      case 'start-dose-prepare-temp-timer':
        componentRef = this.contentComponent.createComponent(fromHomeComponents.StartDosePrepareTempTimerComponent);
        break;
      case 'start-dose-prepare-setup':
        componentRef = this.contentComponent.createComponent(fromHomeComponents.StartDosePrepareSetupComponent);
        break;
      case 'start-dose-prepare-survey':
        componentRef = this.contentComponent.createComponent(fromHomeComponents.StartDosePrepareSurveyComponent);
        break;
      case 'start-dose-prepare-waiting-to-inject':
        componentRef = this.contentComponent.createComponent(fromHomeComponents.StartDosePrepareWaitingToInjectComponent);
        break;
    }
  }
}
