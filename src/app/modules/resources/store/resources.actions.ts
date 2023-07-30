import { Action } from '@ngrx/store';

export enum ActionTypes {
  SetData = '[Resources] SetData',
  UpdateCareTeam = '[Resources] Update Care Team',
  MemberYouCareTeamSelected = '[Resources] Member You Care Team Selected',
}
export class SetData implements Action {
  readonly type = ActionTypes.SetData;

  constructor(public payload: any) {}
}
export class UpdateCareTeam implements Action {
  readonly type = ActionTypes.UpdateCareTeam;

  constructor(public payload: any) {}
}
export class MemberYouCareTeamSelected implements Action {
  readonly type = ActionTypes.MemberYouCareTeamSelected;

  constructor(public payload: any) {}
}
export type ActionsUnion 
  = SetData
  | UpdateCareTeam
  | MemberYouCareTeamSelected;
