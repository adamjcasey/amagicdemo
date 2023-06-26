import { 
  Component, 
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ViewContainerRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SwiperComponent } from "swiper/angular";

// Swiper Config
import SwiperCore, { EffectFade } from 'swiper';
SwiperCore.use([EffectFade]);

import { WelcomeSignUpComponent, WelcomeDosesSelectorComponent } from '@welcome/components';
import * as fromStore from '@shared/store';
import * as fromWelcomeStore from '@welcome/store';

@Component({
  selector: 'automagic-backdrop',
  templateUrl: 'backdrop.component.html',
  styleUrls: ['backdrop.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BackdropComponent implements OnInit {
  public configTop$: Observable<any>;
  public configTop: any;
  @ViewChild('sliderMainMenu', { static: false }) sliderMainMenu!: SwiperComponent;
  @ViewChild('topContentComponent', { read: ViewContainerRef }) topContentComponent!: ViewContainerRef;
  @ViewChild('bottomContentComponent', { read: ViewContainerRef }) bottomContentComponent!: ViewContainerRef;

  public configBottom$: Observable<any>;
  public configBottom: any;

  constructor(
    private _store: Store<fromStore.SharedState>,
  ) {
    this.configTop$ = this._store.select(fromStore.getBackdropTopConfig);
    this.configBottom$ = this._store.select(fromStore.getBackdropBottomConfig);
  }

  isContentEmpty(config: any): boolean {
    return config.template === null && config.component === null;
  }

  ngOnInit() {
    this.configTop$.subscribe(configTop => {
      if (configTop) {
        this.configTop = configTop;
        if (this.configTop.component !== null) {
          this._loadComponent(this.configTop.component);
        }
        else {
          if (this.topContentComponent) {
            this.topContentComponent.clear();
          }
        }
      }
    });

    this.configBottom$.subscribe(configBottom => {
      if (configBottom) {
        this.configBottom = configBottom;
        if (this.configBottom.component !== null) {
          this._loadComponent(this.configBottom.component);
        }
        else {
          if (this.bottomContentComponent) {
            this.bottomContentComponent.clear();
          }
        }
      }
    });
  }

  toggleTop() {
    if (!this.configTop.show) {
      this._store.dispatch(new fromStore.BackdropTopShow({
        transition: 'move',
        header: true,
      }));
    }
    else {
      this._store.dispatch(new fromStore.BackdropTopClose);
      this.topContentComponent.clear();
      if (this.isContentEmpty(this.configTop)) {
        this.menuMoveTo(0);
      }
    }
  }

  closeBotom() {
    this._store.dispatch(new fromStore.BackdropBottomClose);
    this.bottomContentComponent.clear();
  }

  menuMoveTo(step: number) {
    this.sliderMainMenu.swiperRef.slideTo(step);
  }

  private _loadComponent(component: any) {
    switch(component) {
      case 'welcome-sign-up':
        this.topContentComponent.clear();
        this.topContentComponent.createComponent(WelcomeSignUpComponent);
        break;
      case 'welcome-doses-selector':
        this.bottomContentComponent.clear();
        const componentRef = this.bottomContentComponent.createComponent(WelcomeDosesSelectorComponent);
        if (componentRef.instance instanceof WelcomeDosesSelectorComponent) {
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
