import { Action } from '@ngrx/store';
import { NavigationExtras } from '@angular/router';

export enum ActionTypes {
  Go = '[Router] Go',
  Back = '[Router] Back',
  Forward = '[Router] Forward',
  SetFullScreen = '[Layout] Set FullScreen',
  SetRightCornerEl = '[Layout] Set Right Corner Element',
  ClearRightCornerEl = '[Layout] Clear Right Corner Element',
  HideBottomToolbar = '[Layout] Hide BottomToolbar',
}

export class Go implements Action {
  readonly type = ActionTypes.Go;

  constructor(public payload: {
    path: any[];
    query?: object;
    extras?: NavigationExtras;
  }) {}
}

export class Back implements Action {
  readonly type = ActionTypes.Back;
}

export class Forward implements Action {
  readonly type = ActionTypes.Forward;
}

export class SetFullScreen implements Action {
  readonly type = ActionTypes.SetFullScreen;

  constructor(public payload: boolean) {}
}

export class SetRightCornerEl implements Action {
  readonly type = ActionTypes.SetRightCornerEl;

  constructor(public payload: any) {}
}

export class ClearRightCornerEl implements Action {
  readonly type = ActionTypes.ClearRightCornerEl;
}
export class HideBottomToolbar implements Action {
  readonly type = ActionTypes.HideBottomToolbar;

  constructor(public payload: boolean) {}
}

export type ActionsUnion 
  = Go 
  | Back
  | Forward
  | SetFullScreen
  | SetRightCornerEl
  | ClearRightCornerEl
  | HideBottomToolbar;
