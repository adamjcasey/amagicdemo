import {
  Component,
  ViewChild,
  ViewEncapsulation,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewContainerRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';




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
export class SliderPageComponent implements OnInit {
  public config$: Observable<any>;
  public config: any;
  @Input() slides!: Array<any>;
  @Output() onPrevSlide = new EventEmitter<any>();
  @Output() onNextSlide = new EventEmitter<any>();
  @ViewChild('sliderHeader', { static: false }) sliderHeader!: SwiperComponent;
  @ViewChild('componentHeader', { read: ViewContainerRef }) componentHeader!: ViewContainerRef;
  @ViewChild('sliderContent', { static: false }) sliderContent!: SwiperComponent;
  @ViewChild('componentContent', { read: ViewContainerRef }) componentContent!: ViewContainerRef;
  public currentSlide: any;

  public testFormGroup: FormGroup;

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _sanitizer: DomSanitizer,


    private _formBuilder: FormBuilder,
  ) {
    this.config$ = this._store.select(fromStore.getSliderPageConfig);

    this.testFormGroup = this._formBuilder.group({
      name: ['', [ Validators.required ]],
    });
  }

  ngOnInit() {
    this.currentSlide = this.slides[0];
    this.config$.subscribe(config => {
      if (config) {
        if (config.header) {
          // if the most recent config don't have a configured component
          // clean up header component element
          if (config.header.component !== null) {
            // if the one step back config don't have a configured component
            // load the component of the most recent config
            if (this.config?.header?.component === null) {
              this._loadComponent(config.header?.component, 'header');
            }
            else {
              // If in both configs there is a configured component, 
              // validate if they are different component, if they 
              // are different load the component on the most recent config
              if (config.header.component !== this.config?.header?.component) {
                this._loadComponent(config.header?.component, 'header');  
              }
            }
          }
          else {
            this.componentHeader?.clear();
          }

          if (config.header.template) {
            this.currentSlide.header.template = config.header.template;
          }

          if (config.header.color) {
            this.currentSlide.header.color = config.header.color;
          }
        }

        if (config.content) {
          if (config.content.isExpanded) {
            // if the most recent config don't have a configured component
            // clean up header component element
            if (config.content?.component !== null) {
              // if the one step back config don't have a configured component
              // load the component of the most recent config
              if (this.config?.content?.component === null) {
                this._loadComponent(config.content?.component, 'content');
              }
              else {
                // If in both configs there is a configured component, 
                // validate if they are different component, if they 
                // are different load the component on the most recent config
                if (config.content.component !== this.config?.content?.component) {
                  this._loadComponent(config.content?.component, 'content');  
                }
              }
            }
            else {
              // clear content component element if component is null
              this.componentContent?.clear();
            }
          }

          if (config.content.actions) {
            this.slides[this.sliderContent.swiperRef.activeIndex].actions = config.content.actions;
          }
        }
        this.config = config;
      }
    });
  }

  onSliderInit() {  
    this.currentSlide = this.slides[0];
    if (this.currentSlide.header) {
      this._store.dispatch(new fromStore.SliderPageSetHeaderOptions({
        ...this.currentSlide.header,
      }));
    }

    if (this.currentSlide.content) {
      this._store.dispatch(new fromStore.SliderPageSetContentOptions({
        ...this.currentSlide.content,
      }));
    }
  }

  onSlideChange() {
    this.currentSlide = this.slides[this.sliderContent.swiperRef.activeIndex];
    if (this.currentSlide.header) {
      this._store.dispatch(new fromStore.SliderPageSetHeaderOptions({
        ...this.currentSlide.header,
      }));
    }

    if (this.currentSlide.content) {
      this._store.dispatch(new fromStore.SliderPageSetContentOptions({
        ...this.currentSlide.content,
        form: null,
      }));
    }
  }

  slidePrev() {
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
  }

  slideNext() {
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
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  private _loadComponent(component: any, slot: string) {
    // clear template before loading a new component
    this.componentContent?.clear();
    let componentRef;
    let element = slot === 'header' ? this.componentHeader : this.componentContent;
    switch(component) {
      case 'welcome-doses-selector':
        componentRef = element.createComponent(fromWelcomeComponents.WelcomeDosesSelectorComponent);
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
      case 'start-dose-ready-to-inject-video-detail':
        componentRef = element.createComponent(fromHomeComponents.StartDoseReadyToInjectVideoDetailComponent);
        break;
    }
  }
}
