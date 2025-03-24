import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConnectDeviceComponent } from '@core/components/connect-device/connect-device.component';
import { IonButton } from '@ionic/angular/standalone';
import * as fromStore from '@shared/store';

@Component({
  selector: 'automagic-overlay',
  templateUrl: 'overlay.component.html',
  styleUrls: ['overlay.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonButton,
    ConnectDeviceComponent,
  ],
})
export class OverlayComponent implements OnInit, AfterViewInit {
  #store = inject(Store<fromStore.SharedState>);
  #sanitizer = inject(DomSanitizer);

  config$: Observable<any> = this.#store.select(fromStore.getOverlayConfig);
  config: any;
  @ViewChild('overlay') overlay!: ElementRef;
  @ViewChild('contentComponent', { read: ViewContainerRef })
  contentComponent!: ViewContainerRef;

  ngOnInit() {
    this.config$.subscribe((config) => {
      if (config) {
        this.config = config;
        if (this.overlay) {
          const wrapper = this.overlay.nativeElement.parentElement;
          if (this.config.show) {
            wrapper.classList.add('is-shown');
          } else {
            if (wrapper.classList.contains('is-shown')) {
              const content =
                this.overlay.nativeElement.querySelector('.overlay__content');
              if (content) {
                content.style.transform = '';

                void content.offsetWidth;

                content.style.transform = 'translateY(100%)';

                setTimeout(() => {
                  wrapper.classList.remove('is-shown');
                  console.log('Overlay closed');
                }, 400);
              } else {
                wrapper.classList.remove('is-shown');
                console.log('Overlay closed');
              }
            }
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.config$.subscribe((config) => {
      if (config && config.show && config.component && this.contentComponent) {
        this.contentComponent.clear();
        this._loadComponent(config.component);
      }
    });
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this.#sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  handleOverlayClick(event: any) {
    if (event.target.id === 'overlay' && this.config.closeOnOverlayClick) {
      this.closeOverlay();
    }
  }

  closeOverlay(): void {
    console.log('Closing overlay');
    if (this.overlay) {
      const content =
        this.overlay.nativeElement.querySelector('.overlay__content');
      if (content) {
        content.style.transform = 'translateY(100%)';
      }
    }

    setTimeout(() => {
      this.#store.dispatch(new fromStore.OverlayHide());
    }, 50);
  }

  private _loadComponent(componentName: string) {
    this.contentComponent.clear();

    try {
      switch (componentName) {
        case 'ConnectDeviceComponent':
          const componentRef = this.contentComponent.createComponent(
            ConnectDeviceComponent
          );
          componentRef.instance.connectionComplete.subscribe(() => {
            console.log('Device connection completed');
            this.closeOverlay();
          });
          break;
        default:
          console.warn('Unknown component:', componentName);
          break;
      }
    } catch (error) {
      console.error('Error loading component:', componentName, error);
    }
  }
}
