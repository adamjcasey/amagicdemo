import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonIcon, IonImg } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronForward } from 'ionicons/icons';
import { DatepickerComponent } from '../datepicker/datepicker.component';

@Component({
  selector: 'automagic-accordion',
  templateUrl: 'accordion.component.html',
  styleUrls: ['accordion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatepickerComponent,
    IonIcon,
    IonImg,
  ],
})
export class AccordionComponent {
  @Input() config: any;

  constructor(private _sanitizer: DomSanitizer) {
    addIcons({ checkmarkCircle, chevronForward });
  }

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
