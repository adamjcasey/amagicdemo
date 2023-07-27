import { 
  Component, 
  Input, 
  Output,
  EventEmitter, 
  ViewEncapsulation, 
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

  constructor(
    private _sanitizer: DomSanitizer,
  ) {}

  // if the toggle behavior (hide/expand) as an accordion is required
  // this could be used for that
  // toggle() {
  //   if (typeof this.config.close === 'undefined') {
  //     this.config.close = false;
  //   }
  //   this.config.close = !this.config.close;
  // }

  // if the check/uncheck behaviors need to be use from the component
  // and not dynamically
  // onTaskCheck(event: any) {
  //   event.preventDefault();
  //   event.stopImmediatePropagation();
  //   if (typeof this.config.completed === 'undefined') {
  //     this.config.completed = false;
  //   }
  // }

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}
