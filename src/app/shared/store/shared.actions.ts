import { Action } from '@ngrx/store';

export enum ActionTypes {
  OverlayShow = '[Overlay] Show Overlay',
  OverlayClose = '[Overlay] Close Overlay',
  OverlayOptions = '[Overlay] Set Options',
  OverlayContent = '[Overlay] Set Content',
}
export class OverlayShow implements Action {
  readonly type = ActionTypes.OverlayShow;

  constructor(public payload: any) {}
}
export class OverlayClose implements Action {
  readonly type = ActionTypes.OverlayClose;
}
export class OverlayOptions implements Action {
  readonly type = ActionTypes.OverlayOptions;

  constructor(public payload: any) {}
}
export class OverlayContent implements Action {
  readonly type = ActionTypes.OverlayContent;

  constructor(public payload: any) {}
}
export type ActionsUnion 
  = OverlayShow 
  | OverlayClose
  | OverlayOptions
  | OverlayContent;
