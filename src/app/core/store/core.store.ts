import * as fromRouter from '@ngrx/router-store';

import * as fromReducer from './core.reducer';

export interface CoreState {
  router: fromRouter.RouterReducerState<fromReducer.RouterState>;
}

export interface LayoutState {
  fullScreen: boolean;
  rightCornerEl: any,
}

export const initialState: LayoutState = {
  fullScreen: false,
  rightCornerEl: null,
}
