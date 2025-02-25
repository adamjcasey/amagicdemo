import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'automagic-error',
  templateUrl: 'error.page.html',
  styleUrls: ['error.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // CoreStoreModule,
  ],
})
export class ErrorPage {
  constructor() {}
}
