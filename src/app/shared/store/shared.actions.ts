import { Action } from '@ngrx/store';

export enum ActionTypes {
  BackdropShow = '[Backdrop] Show',
  BackdropClose = '[Backdrop] Close',
  BackdropConfig = '[Backdrop] Set Options',
  SliderPageExpandContent = '[SliderPage] Expand Content',
}
export class BackdropShow implements Action {
  readonly type = ActionTypes.BackdropShow;

  constructor(public payload: any) {}
}
export class BackdropClose implements Action {
  readonly type = ActionTypes.BackdropClose;
}
export class BackdropConfig implements Action {
  readonly type = ActionTypes.BackdropConfig;

  constructor(public payload: any) {}
}
export class SliderPageExpandContent implements Action {
  readonly type = ActionTypes.SliderPageExpandContent;

  constructor(public payload: any) {}
}

export type ActionsUnion 
  = BackdropShow 
  | BackdropClose
  | BackdropConfig
  | SliderPageExpandContent;
