import { 
  AfterViewInit,
  Component, 
  Input, 
  ViewEncapsulation 
} from '@angular/core';

@Component({
  selector: 'automagic-hero',
  templateUrl: 'hero.component.html',
  styleUrls: ['hero.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeroComponent implements AfterViewInit {
  @Input() color: string = '';
  @Input() image: string = '';
  @Input() template!: string;
  @Input() actions: any[] = [];
  public initialized: boolean = false;

  constructor() {}

  ngAfterViewInit() {
    this.initialized = true;
  }
}
