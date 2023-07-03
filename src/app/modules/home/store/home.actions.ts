import { Action } from '@ngrx/store';

export enum ActionTypes {
  SetData = '[Home] SetData',
}
export class SetData implements Action {
  readonly type = ActionTypes.SetData;

  constructor(public payload: any) {}
}
export type ActionsUnion 
  = SetData;
