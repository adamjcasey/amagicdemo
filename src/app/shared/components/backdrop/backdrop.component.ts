import { 
  Component, 
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { animate  } from 'motion';
import { SwiperComponent } from "swiper/angular";
import SwiperCore, { EffectFade } from 'swiper';
// install Swiper modules
SwiperCore.use([EffectFade]);

import * as fromStore from '@shared/store';
import * as fromDirectives from '@shared/directives';

import { WelcomeSignUpComponent } from '@welcome/components';

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
  @ViewChild(fromDirectives.HostDirective, {static: true}) host!: fromDirectives.HostDirective;


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
        if (this.configTop?.component !== null) {
          this._loadComponent(this.host);
        }
        else {
          this.host.viewContainerRef.clear();
        }
      }
    });

    this.configBottom$.subscribe(configBottom => {
      if (configBottom) {
        this.configBottom = configBottom;
        if (this.configBottom.component !== null) {
          this._loadComponent(this.host);
        }
        else {
          this.host.viewContainerRef.clear();
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
      if (this.isContentEmpty(this.configTop)) {
        this.menuMoveTo(0);
      }
      else {
        this.host.viewContainerRef.clear();
      }
    }
  }

  menuMoveTo(step: number) {
    this.sliderMainMenu.swiperRef.slideTo(step);
  }

  private _loadComponent(host: any) {
    const viewContainerRef = host.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(WelcomeSignUpComponent);
  }
}
