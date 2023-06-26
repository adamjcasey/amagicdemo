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

  openBackdropBottom(config: any) {
    this._store.dispatch(new fromSharedStore.BackdropBottomShow({
      header: false,
      template: `<br><br><br><br><br><br><br><br><h1>Hello World</h1>`,
      closeButton: config.closeButton,
      bgColor: config.bgColor,
      toolbar: {
        actions: [
          {
            label: 'Action 1',
            action: () => {
              console.log('toolbar action 1');
            },
          },
          {
            label: 'Action 2',
            action: () => {
              console.log('toolbar action 2');
            },
          },
        ],
      }
    }));
  }

}
