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
  @ViewChild('topContentComponent', { read: ViewContainerRef }) topContentComponent!: ViewContainerRef;

  constructor(
    private _store: Store<fromStore.SharedState>,
  ) {
    this.config$ = this._store.select(fromStore.getBackdropConfig);
  }

  isContentEmpty(): boolean {
    return this.config.template === null && this.config.component === null;
  }

  ngOnInit() {
    this.config$.subscribe(config => {
      if (config) {
        this.config = config;
        if (this.config.component !== null) {
          this._loadComponent(this.config.component);
        }
        else {
          if (this.topContentComponent) {
            this.topContentComponent.clear();
          }
        }
      }
    });
  }

  toggleTop() {
    if (!this.config.show) {
      this._store.dispatch(new fromStore.BackdropShow({
        transition: 'move',
        header: true,
      }));
    }
    else {
      this._store.dispatch(new fromStore.BackdropClose);
      this.topContentComponent.clear();
      if (this.isContentEmpty()) {
        this.menuMoveTo(0);
      }
    }
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
    }
  }
}
