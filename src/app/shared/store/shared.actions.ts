import { Action } from '@ngrx/store';

export enum ActionTypes {
  BackdropShow = '[Backdrop] Show',
  BackdropClose = '[Backdrop] Close',
  BackdropSetConfig = '[Backdrop] Set Config',
  SliderPageSetContent = '[SliderPage] Set Content',
  SliderPageSetContentOptions = '[SliderPage] Set Content Options',
  AlertShow = '[Alert] Show',
  AlertHide = '[Alert] Hide',
  AlertSetConfig = '[Alert] Set Config',
}
export class BackdropShow implements Action {
  readonly type = ActionTypes.BackdropShow;

  constructor(public payload: any) {}
}
export class BackdropClose implements Action {
  readonly type = ActionTypes.BackdropClose;
}
export class BackdropSetConfig implements Action {
  readonly type = ActionTypes.BackdropSetConfig;

  constructor(public payload: any) {}
}

export class SliderPageSetContent implements Action {
  readonly type = ActionTypes.SliderPageSetContent;

  constructor(public payload: any) {}
}
export class SliderPageSetContentOptions implements Action {
  readonly type = ActionTypes.SliderPageSetContentOptions;

  constructor(public payload: any) {}
}

export class AlertShow implements Action {
  readonly type = ActionTypes.AlertShow;

  constructor(public payload: any) {}
}
export class AlertClose implements Action {
  readonly type = ActionTypes.AlertHide;
}
export class AlertSetConfig implements Action {
  readonly type = ActionTypes.AlertSetConfig;

  constructor(public payload: any) {}
}

export type ActionsUnion 
  = BackdropShow 
  | BackdropClose
  | BackdropSetConfig
  | SliderPageSetContent
  | SliderPageSetContentOptions
  | AlertShow 
  | AlertClose
  | AlertSetConfig;
