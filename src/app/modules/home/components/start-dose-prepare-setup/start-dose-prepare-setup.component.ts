import { 
  Component,
  ViewEncapsulation, 
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-start-dose-prepare-setup',
  templateUrl: 'start-dose-prepare-setup.component.html',
  styleUrls: ['start-dose-prepare-setup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartDosePrepareSetupComponent implements OnInit {
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;
  public timer!: number;

  constructor(
    private _store: Store<fromCoreStore.CoreState>,
  ) {
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  }

  ngOnInit() {
    this.layoutConfig$.subscribe(layoutConfig => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;

        if (this.layoutConfig.rightCornerEl) {
          this.timer = this.layoutConfig.rightCornerEl.timer;
        }
      }
    });
  }
}
