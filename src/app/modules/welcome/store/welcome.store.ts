import * as moment from 'moment';

import { environment } from 'src/environments/environment';

export interface WelcomeState {
  pin?: number;
  name?: string;
  doses?: Array<Date>;
}

let initialState: WelcomeState;
if (environment.production) {
  initialState = {
    name: '',
    doses: []
  }
}
else {
  initialState = {
    name: 'Developer',
    doses: [],
  }
}

export { initialState };
