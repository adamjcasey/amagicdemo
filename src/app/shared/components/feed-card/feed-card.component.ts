import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonButton, IonIcon, IonImg } from '@ionic/angular/standalone';

import moment from 'moment';

@Component({
  selector: 'automagic-feed-card',
  templateUrl: 'feed-card.component.html',
  styleUrls: ['feed-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonImg,
    IonButton,
    IonIcon,
  ],
})
export class FeedCardComponent {
  @Input() config: any;

  constructor(private _sanitizer: DomSanitizer) {}

  postAtFormatDate(date: Date) {
    return moment(date).fromNow();
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}
