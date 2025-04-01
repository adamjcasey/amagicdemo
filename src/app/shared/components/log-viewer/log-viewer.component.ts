import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import * as fromStore from '@shared/store';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { LogEntry, LogViewerService } from '../../services/log-viewer.service';

@Component({
  selector: 'automagic-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogViewerComponent {
  private store = inject(Store);
  private logViewerService = inject(LogViewerService);

  logs$: Observable<LogEntry[]> = this.logViewerService.logs$;

  constructor() {
    addIcons({
      closeOutline,
      trashOutline,
    });
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('#close-log-viewer')) {
      console.log('Close button clicked via HostListener');
      this.closeOverlay();
    }
  }

  closeOverlay(): void {
    console.log('LogViewerComponent: Closing overlay');
    this.store.dispatch(new fromStore.OverlayHide());
  }

  clearLogs(): void {
    this.logViewerService.clearLogs();
  }

  formatDate(date: Date): string {
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

    return `${formattedDate}.${milliseconds}`;
  }

  formatPayload(payload: any): string {
    if (payload === undefined) return '';
    try {
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      return '[Non-serializable payload]';
    }
  }
}
