import { Action } from '@ngrx/store';

export enum ActionTypes {
  BackdropTopShow = '[BackdropTop] Show',
  BackdropTopClose = '[BackdropTop] Close',
  BackdropTopOptions = '[BackdropTop] Set Options',
  BackdropTopContent = '[BackdropTop] Set Content',
  BackdropBottomShow = '[BackdropBottom] Show',
  BackdropBottomClose = '[BackdropBottom] Close',
  BackdropBottomOptions = '[BackdropBottom] Set Options',
  BackdropBottomContent = '[BackdropBottom] Set Content',
}
export class BackdropTopShow implements Action {
  readonly type = ActionTypes.BackdropTopShow;

  constructor(public payload: any) {}
}
export class BackdropTopClose implements Action {
  readonly type = ActionTypes.BackdropTopClose;
}
export class BackdropTopOptions implements Action {
  readonly type = ActionTypes.BackdropTopOptions;

  constructor(public payload: any) {}
}
export class BackdropTopContent implements Action {
  readonly type = ActionTypes.BackdropTopContent;

  constructor(public payload: any) {}
}

export class BackdropBottomShow implements Action {
  readonly type = ActionTypes.BackdropBottomShow;

  constructor(public payload: any) {}
}
export class BackdropBottomClose implements Action {
  readonly type = ActionTypes.BackdropBottomClose;
}
export class BackdropBottomOptions implements Action {
  readonly type = ActionTypes.BackdropBottomOptions;

  constructor(public payload: any) {}
}
export class BackdropBottomContent implements Action {
  readonly type = ActionTypes.BackdropBottomContent;

  constructor(public payload: any) {}
}

export type ActionsUnion 
  = BackdropTopShow 
  | BackdropTopClose
  | BackdropTopOptions
  | BackdropTopContent
  | BackdropBottomShow 
  | BackdropBottomClose
  | BackdropBottomOptions
  | BackdropBottomContent;
