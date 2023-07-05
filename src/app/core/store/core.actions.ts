import { Action } from '@ngrx/store';
import { NavigationExtras } from '@angular/router';

export enum ActionTypes {
  Go = '[Router] Go',
  Back = '[Router] Back',
  Forward = '[Router] Forward',
  SetFullScreen = '[Router] SetFullScreen',
}

export class Go implements Action {
  readonly type = ActionTypes.Go;

  constructor(public payload: {
    path: [];
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

export type ActionsUnion 
  = Go 
  | Back
  | Forward
  | SetFullScreen;
