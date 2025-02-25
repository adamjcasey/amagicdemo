import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-hero',
  templateUrl: 'hero.component.html',
  styleUrls: ['hero.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonImg],
})
export class HeroComponent implements AfterViewInit {
  @Input() color: string = '';
  @Input() image: string = '';
  @Input() template!: string;
  @Input() actions: any[] = [];
  @Input() extraCss: string = '';
  public initialized: boolean = false;

  constructor() {}

  ngAfterViewInit() {
    this.initialized = true;
  }
}
