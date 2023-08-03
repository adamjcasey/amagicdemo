import { Action } from '@ngrx/store';

export enum ActionTypes {
  BackdropShow = '[Backdrop] Show',
  BackdropHide = '[Backdrop] Close',
  BackdropSetConfig = '[Backdrop] Set Config',
  SliderPageSetHeader = '[SliderPage] Set Header',
  SliderPageSetHeaderOptions = '[SliderPage] Set Header Options',
  SliderPageSetContent = '[SliderPage] Set Content',
  SliderPageSetContentOptions = '[SliderPage] Set Content Options',
  SliderPageClear = '[SliderPage] Clear Component',
  AlertShow = '[Alert] Show',
  AlertHide = '[Alert] Hide',
  AlertSetConfig = '[Alert] Set Config',
  BottomToolbarShow = '[BottomToolbar] Show',
  BottomToolbarHide = '[BottomToolbar] Hide',
  TopbarChangeColor = '[Topbar] Chnage Color',
  TopbarPendingNotifications = '[Topbar] Pending Notifications',
}
export class BackdropShow implements Action {
  readonly type = ActionTypes.BackdropShow;

  constructor(public payload: any) {}
}
export class BackdropHide implements Action {
  readonly type = ActionTypes.BackdropHide;
}
export class BackdropSetConfig implements Action {
  readonly type = ActionTypes.BackdropSetConfig;

  constructor(public payload: any) {}
}

export class SliderPageSetHeader implements Action {
  readonly type = ActionTypes.SliderPageSetHeader;

  constructor(public payload: any) {}
}
export class SliderPageSetHeaderOptions implements Action {
  readonly type = ActionTypes.SliderPageSetHeaderOptions;

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
export class SliderPageClear implements Action {
  readonly type = ActionTypes.SliderPageClear;
}

export class AlertShow implements Action {
  readonly type = ActionTypes.AlertShow;

  constructor(public payload: any) {}
}
export class AlertHide implements Action {
  readonly type = ActionTypes.AlertHide;
}
export class AlertSetConfig implements Action {
  readonly type = ActionTypes.AlertSetConfig;

  constructor(public payload: any) {}
}

export class BottomToolbarShow implements Action {
  readonly type = ActionTypes.BottomToolbarShow;
}
export class BottomToolbarHide implements Action {
  readonly type = ActionTypes.BottomToolbarHide;
}

export class TopbarChangeColor implements Action {
  readonly type = ActionTypes.TopbarChangeColor;

  constructor(public payload: any) {}
}
export class TopbarPendingNotifications implements Action {
  readonly type = ActionTypes.TopbarPendingNotifications;

  constructor(public payload: any) {}
}

export type ActionsUnion 
  = BackdropShow 
  | BackdropHide
  | BackdropSetConfig
  | SliderPageSetHeader
  | SliderPageSetHeaderOptions
  | SliderPageSetContent
  | SliderPageSetContentOptions
  | SliderPageClear
  | AlertShow 
  | AlertHide
  | AlertSetConfig
  | BottomToolbarShow
  | BottomToolbarHide
  | TopbarChangeColor
  | TopbarPendingNotifications;
