import { Action } from '@ngrx/store';

export enum ActionTypes {
  SetData = '[Home] SetData',
  CompleteOnBoardingTask = '[Home] CompleteOnBoardingTask'
}
export class SetData implements Action {
  readonly type = ActionTypes.SetData;

  constructor(public payload: any) {}
}
export class CompleteOnBoardingTask implements Action {
  readonly type = ActionTypes.CompleteOnBoardingTask;

  constructor(public payload: any) {}
}
export type ActionsUnion 
  = SetData
  | CompleteOnBoardingTask;
