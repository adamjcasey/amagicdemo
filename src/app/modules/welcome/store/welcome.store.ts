import * as moment from 'moment';

import { environment } from 'src/environments/environment';

export interface WelcomeState {
  pin?: number;
  name?: string;
  doses?: Array<Date>;
  bleAllowed: boolean;
  notificationsAllowed: boolean;
}

let initialState: WelcomeState;
if (environment.production) {
  initialState = {
    name: '',
    doses: [],
    bleAllowed: false,
    notificationsAllowed: false,
  }
}
else {
  initialState = {
    name: 'Developer',
    doses: [],
    bleAllowed: false,
    notificationsAllowed: false,
  }
}

export { initialState };
