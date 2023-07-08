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
  selector: 'automagic-alert',
  templateUrl: 'alert.component.html',
  styleUrls: ['alert.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlertComponent implements OnInit {
  public config$: Observable<any>;
  public config: any;
  @ViewChild('contentComponent', { read: ViewContainerRef }) contentComponent!: ViewContainerRef;

  constructor(
    private _store: Store<fromStore.SharedState>,
    private _sanitizer: DomSanitizer,
  ) {
    this.config$ = this._store.select(fromStore.getAlertConfig);
  }

  ngOnInit() {
    this.config$.subscribe(config => {
      if (config) {
        if (config.show) {
          // if the most recent config don't have a configured component
          // clean up content component element
          if (config.component === null) {
            this.contentComponent?.clear();
          }
          else {
            // if the one step back config don't have a configured component
            // load the component of the most recent config
            if (this.config.component === null) {
              this._loadComponent(config.component);
            }
            else {
              // If in both configs there is a configured component, 
              // validate if they are different component, if they 
              // are different load the component on the most recent config
              if (config.component !== this.config.component) {
                this._loadComponent(config.component);  
              }
            }
          }
        }
        this.config = config;
      }
    });
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  private _loadComponent(component: any) {
    this.contentComponent.clear();
    // add the each component that you want to support into an AlertComponent
    // switch(component) {
    //   case 'welcome-sign-up':
    //     this.contentComponent.createComponent(WelcomeSignUpComponent);
    //     break;
    // }
  }
}
