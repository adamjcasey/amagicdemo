import { 
  Component, 
  Input, 
  ViewEncapsulation 
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import * as moment from 'moment';

@Component({
  selector: 'automagic-feed-card',
  templateUrl: 'feed-card.component.html',
  styleUrls: ['feed-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeedCardComponent {
  @Input() config: any;

  constructor(
    private _sanitizer: DomSanitizer,
  ) {}

  postAtFormatDate(date: Date) {
    return moment(date).fromNow();
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}
