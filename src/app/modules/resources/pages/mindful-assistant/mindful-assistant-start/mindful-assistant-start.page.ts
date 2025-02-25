import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonContent, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-mindful-assistant-start',
  templateUrl: './mindful-assistant-start.page.html',
  styleUrls: ['./mindful-assistant-start.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonImg,
  ],
})
export class MindfulAssistantStartPage {
  constructor() {}
}
