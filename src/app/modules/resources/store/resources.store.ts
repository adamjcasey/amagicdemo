import { environment } from 'src/environments/environment';
import * as moment from 'moment';

export interface ResourcesState {
  entryPageVisited: boolean;
  yourCareTeamPageVisited: boolean;
}

let initialState: ResourcesState;
if (environment.production) {
  initialState = {
    entryPageVisited: false,
    yourCareTeamPageVisited: false,
  }
}
else {
  initialState = {
    entryPageVisited: false,
    yourCareTeamPageVisited: false,
  }
}

export { initialState }
