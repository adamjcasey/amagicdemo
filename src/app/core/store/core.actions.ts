import { Action } from '@ngrx/store';
import { NavigationExtras } from '@angular/router';

export enum ActionTypes {
  Go = '[Router] Go',
  Back = '[Router] Back',
  Forward = '[Router] Forward',
  Unsuscribe = '[Router] Unsuscribe',
  Unsuscribed = '[Router] Unsuscribed',
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

export class Unsuscribe implements Action {
  readonly type = ActionTypes.Unsuscribe;

  constructor(public payload: any) {}
}

export class Unsuscribed implements Action {
  readonly type = ActionTypes.Unsuscribed;

  constructor(public payload: any) {}
}

export type ActionsUnion 
  = Go 
  | Back
  | Forward
  | Unsuscribe
  | Unsuscribed;
