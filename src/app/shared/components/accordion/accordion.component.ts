import { 
  Component, 
  Input, 
  Output,
  EventEmitter, 
  ViewEncapsulation 
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'automagic-accordion',
  templateUrl: 'accordion.component.html',
  styleUrls: ['accordion.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccordionComponent {
  @Input() config: any;
  @Output() onTaskCheck = new EventEmitter();

  constructor(
    private _sanitizer: DomSanitizer,
  ) {}

  toggle() {
    if (typeof this.config.close === 'undefined') {
      this.config.close = false;
    }

    this.config.close = !this.config.close;
  }

  taskCheck(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (typeof this.config.check === 'undefined') {
      this.config.check = false;
    }
    this.onTaskCheck.emit(!this.config.check);
  }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}
