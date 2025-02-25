import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-card',
  templateUrl: 'card.component.html',
  styleUrls: ['card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonIcon],
})
export class CardComponent {
  @Input() card: any;

  constructor(private _sanitizer: DomSanitizer) {}

  sanitizeContent(htmlContent: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}
