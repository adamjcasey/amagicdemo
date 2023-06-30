import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromSharedStore from '@shared/store';

@Component({
  selector: 'automagic-components',
  templateUrl: 'components.page.html',
  styleUrls: ['components.page.scss'],
})
export class ComponentsPage {

  constructor(
    private _store: Store<fromSharedStore.SharedState>,
  ) {}

}
