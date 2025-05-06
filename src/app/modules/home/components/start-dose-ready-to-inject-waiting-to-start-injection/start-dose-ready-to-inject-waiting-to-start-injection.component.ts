import { CommonModule } from '@angular/common';
import {
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'automagic-start-dose-ready-to-inject-waiting-to-start-injection',
  templateUrl:
    'start-dose-ready-to-inject-waiting-to-start-injection.component.html',
  styleUrls: [
    'start-dose-ready-to-inject-waiting-to-start-injection.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class StartDoseReadyToInjectWaitingToStartInjectionComponent {}
