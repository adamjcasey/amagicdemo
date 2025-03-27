import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConnectDeviceComponent } from '@core/components/connect-device/connect-device.component';
import { IonButton } from '@ionic/angular/standalone';
import * as fromStore from '@shared/store';
import { DebugMenuComponent } from '../debug-menu/debug-menu.component';
import { LogViewerComponent } from '../log-viewer/log-viewer.component';

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
    LogViewerComponent,
    DebugMenuComponent,
  ],
})
export class OverlayComponent implements OnInit, OnDestroy {
  #store = inject(Store<fromStore.SharedState>);
  #sanitizer = inject(DomSanitizer);
  #destroy$ = new Subject<void>();

  #lastComponentName = '';

  config$: Observable<any> = this.#store.select(fromStore.getOverlayConfig);
  config: any;
  @ViewChild('overlay') overlay!: ElementRef;
  @ViewChild('contentComponent', { read: ViewContainerRef })
  contentComponent!: ViewContainerRef;

  ngOnInit(): void {
    this.config$.pipe(takeUntil(this.#destroy$)).subscribe((config) => {
      if (config) {
        this.config = config;
        if (this.overlay) {
          const wrapper = this.overlay.nativeElement.parentElement;

          if (this.config.show) {
            wrapper.classList.add('is-shown');
            // Reset transform when showing overlay
            const content =
              this.overlay.nativeElement.querySelector('.overlay__content');
            if (content) {
              content.style.transform = '';
            }
            // Load the component when showing the overlay
            this._loadComponent(this.config.component);
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
                  this.#lastComponentName = '';
                  if (this.contentComponent) {
                    this.contentComponent.clear();
                  }
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

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
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

  handleOverlayClick(event: MouseEvent): void {
    if (
      event.target instanceof HTMLElement &&
      event.target.id === 'overlay' &&
      this.config.closeOnOverlayClick
    ) {
      this.closeOverlay();
    }
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this.#sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  private _loadComponent(componentName: string) {
    if (this.#lastComponentName === componentName) {
      console.log('Component already loaded:', componentName);
      return;
    }

    console.log('Loading component:', componentName);

    this.contentComponent.clear();
    this.#lastComponentName = componentName;

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
        case 'LogViewerComponent':
          this.contentComponent.createComponent(LogViewerComponent);
          break;
        case 'DebugMenuComponent':
          this.contentComponent.createComponent(DebugMenuComponent);
          break;
        default:
          console.warn('Unknown component:', componentName);
          this.#lastComponentName = '';
          break;
      }
    } catch (error) {
      console.error('Error loading component:', componentName, error);
      this.#lastComponentName = '';
    }
  }
}
