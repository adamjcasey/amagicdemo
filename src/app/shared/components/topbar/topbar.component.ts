import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '../../store';
import * as fromCoreStore from '@core/store';

@Component({
  selector: 'automagic-topbar',
  templateUrl: 'topbar.component.html',
  styleUrls: ['topbar.component.scss'],
})
export class TopBarComponent implements OnInit {
  public layoutConfig$!: Observable<any>;
  public layoutConfig: any;

  constructor(
    private _store: Store<fromStore.SharedState>,
  ) {
    this.layoutConfig$ = this._store.select(fromCoreStore.getLayoutConfig);
  }

  ngOnInit() {
    this.layoutConfig$.subscribe(layoutConfig => {
      if (layoutConfig) {
        this.layoutConfig = layoutConfig;
      }
    });
  }
}
