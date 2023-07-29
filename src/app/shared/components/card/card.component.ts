import { 
  Component, 
  Input, 
  ViewEncapsulation 
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'automagic-card',
  templateUrl: 'card.component.html',
  styleUrls: ['card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardComponent {
  @Input() card: any;

  constructor(
    private _sanitizer: DomSanitizer,
  ) {}

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}
