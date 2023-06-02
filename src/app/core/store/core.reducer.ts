import { ActionReducerMap } from '@ngrx/store';
import { Params, RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer, routerReducer} from '@ngrx/router-store';

import * as fromStore from './core.store';

export interface RouterState {
  url: string,
  params: Params,
  queryParams: Params
}

export class CustomRouterStateSerializer implements RouterStateSerializer<RouterState> {
  serialize(routerState: RouterStateSnapshot): RouterState {
    let route = routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const { url, root: { queryParams } } = routerState;
    const { params } = route;

    return { url, params, queryParams };
  }
}

export const CoreReducers: ActionReducerMap<fromStore.CoreState> = {
  router: routerReducer
};
