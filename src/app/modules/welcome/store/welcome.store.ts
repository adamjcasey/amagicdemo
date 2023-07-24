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
    doses: [
      new Date(moment().toString()),
      new Date(moment().add(1, 'week').toString()),
      new Date(moment().add(2, 'weeks').toString()),
      new Date(moment().add(3, 'weeks').toString()),
      new Date(moment().add(5, 'weeks').toString()),
      new Date(moment().add(7, 'weeks').toString()),
    ],
  }
}

export { initialState };
