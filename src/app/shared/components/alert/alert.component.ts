import { 
  Component, 
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ViewContainerRef,
  ElementRef
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// Swiper Config
import SwiperCore, { EffectFade } from 'swiper';
SwiperCore.use([EffectFade]);

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
  @ViewChild('alert') alert!: ElementRef;
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
        this.config = config;
        if (this.alert) {
          const wrapper = this.alert.nativeElement.parentElement;
          if (this.config.show) {
            wrapper.classList.add('is-shown');
            if (this.config.overlay) {
              wrapper.classList.add('show-overlay');
            }
          }
          else {
            wrapper.classList.remove('is-shown');
            if (wrapper.classList.contains('show-overlay')) {
              wrapper.classList.remove('show-overlay');
            }
          }
        }
      }
    });
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  handleOverlayClick(event: any) {
    if (event.target.id === 'alert') {
      if (this.config.actions && this.config.actions.length > 0) {
        const lastAction = this.config.actions[this.config.actions.length - 1];
        if (lastAction.action) {
          lastAction.action();
        }
      }
      else {
        this._store.dispatch(new fromStore.AlertHide);
      }
    }
  }
}
