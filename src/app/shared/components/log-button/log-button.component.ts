import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import * as fromSharedStore from '@shared/store';
import { addIcons } from 'ionicons';
import { terminalOutline } from 'ionicons/icons';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'automagic-log-button',
  templateUrl: './log-button.component.html',
  styleUrls: ['./log-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class LogButtonComponent implements OnInit, OnDestroy {
  #store = inject(Store);
  destroy$ = new Subject<void>();

  isDebugMenuVisible = false;

  constructor() {
    addIcons({
      terminalOutline,
    });
  }

  ngOnInit(): void {
    this.#store
      .select(fromSharedStore.getOverlayConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        this.isDebugMenuVisible = !!(
          config?.show && config?.component === 'DebugMenuComponent'
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDebugMenu(): void {
    if (this.isDebugMenuVisible) {
      this.#store.dispatch(new fromSharedStore.OverlayHide());
    } else {
      this.#store.dispatch(
        new fromSharedStore.OverlayShow({
          show: true,
          component: 'DebugMenuComponent',
        })
      );
    }
  }
}
