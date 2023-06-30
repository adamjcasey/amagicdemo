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
import { Store } from '@ngrx/store';
import { animate, spring  } from 'motion';

// Swiper Config
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Pagination, EffectFade } from 'swiper';
SwiperCore.use([Pagination, EffectFade]);

import * as fromWelcomeComponents from '@welcome/components'
import * as fromSharedStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';

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
  public currentSlide: any;
  public configContent: any;

  constructor(
    private _store: Store<fromSharedStore.SharedState>,
  ) {}

  ngOnInit(): void {
    this.currentSlide = this.slides[0];
  }

  ngAfterContentInit() {
    this.onContentInit.emit();
  }

  slidePrev() {
    if (typeof this.onPrevSlide === 'function') {
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

  expandContent(config: any) {
    this.configContent = config;
    const easingConfig = {
      stiffness: 80,
      damping: 20,
      mass: 1,
      velocity: 800,
    };

    if (this.configContent.isExpanded) {
      animate(
        `.slider-page`, 
        { paddingTop: `0px` },
        { easing: spring(easingConfig) }
      );

      animate(
        `.slider-page__content`, 
        { height: `${window.innerHeight}px` },
        { easing: spring(easingConfig) }
      );

      animate(
        `.slider-page__content .wrapper-small`, 
        { opacity: [ 0.75, 0.5, 0 ] },
        {
          easing: 'ease-in-out',
          duration: 0.2,
        },
      );

      animate(
        `.slider-page__content .wrapper-large`, 
        { opacity: [ 0, 0.5, 1 ] },
        {
          easing: 'ease-in-out',
          duration: 0.4,
        },
      );

      if (this.configContent.component !== null) {
        this._loadComponent(this.configContent.component);
      }
    }
    else {
      animate(
        `.slider-page`, 
        { paddingTop: `${window.innerHeight * 0.55}px` },
        { easing: spring(easingConfig) }
      );

      animate(
        `.slider-page__content`, 
        { height: `${window.innerHeight * 0.45}px` },
        { easing: spring(easingConfig) }
      ).finished.then(() => {
        this.contentComponent.clear();
      });

      animate(
        `.slider-page__content .wrapper-small`, 
        { opacity: [ 0, 0.25, 0.5, 1 ] },
        {
          easing: 'ease-in-out',
          duration: 0.4,
        },
      );

      animate(
        `.slider-page__content .wrapper-large`, 
        { opacity: [ 0.75, 0.5, 0 ] },
        {
          easing: 'ease-in-out',
          duration: 0.2,
        },
      );
    }
  }

  private _loadComponent(component: any) {
    switch(component) {
      case 'welcome-doses-selector':
        this.contentComponent.clear();
        const componentRef = this.contentComponent.createComponent(fromWelcomeComponents.WelcomeDosesSelectorComponent);
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
    }
  }
}
