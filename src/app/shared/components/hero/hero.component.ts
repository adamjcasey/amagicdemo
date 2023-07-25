import { 
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
export class HeroComponent {
  @Input() color: string = '';
  @Input() image: string = '';
  @Input() template!: string;
  @Input() actions: any[] = [];
  @Input() icon: string = '';

  constructor() {}

}
