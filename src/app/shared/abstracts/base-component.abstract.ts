import { Directive, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import * as fromCoreStore from '@core/store';

@Directive()
export abstract class BaseComponentAbstract implements OnDestroy {
  protected store = inject(Store<fromCoreStore.CoreState>);
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected goTo(path: string) {
    this.store.dispatch(
      new fromCoreStore.Go({
        path: [path],
      })
    );
  }
}
