import * as moment from 'moment';

import { environment } from 'src/environments/environment';

export interface HomeState {
  firstTimeDose: boolean;
  doses: any[];
  bodyPartSelected: string;
  dosingStarted: boolean;
  timeTravelingDemoDone: boolean;
  flareUpsDemoDone: boolean;
  allCompletedDoses: boolean;
  onBoardingTasks: any[];
  onBoardingDone: boolean;
}
let initialState: HomeState;
if (environment.production) {
  initialState = {
    firstTimeDose: true,
    doses: [
      {
        marked: false,
        date: '',
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: '',
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: '',
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: '',
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: '',
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: '',
        bodyPartInjected: '',
        notes: null,
      }
    ],
    bodyPartSelected: '',
    dosingStarted: false,
    timeTravelingDemoDone: false,
    flareUpsDemoDone: false,
    allCompletedDoses: false,
    onBoardingTasks: [
      {
        completed: false,
        title: 'Activity Calendar',
        description: 'This calendar tracks doses and flareups and reminders.',
      },
      {
        completed: false,
        title: 'Activity Dose Report',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      },
      {
        completed: false,
        title: 'Activity Progress',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      },
      {
        completed: false,
        title: 'Activity Symptom Report',
        description: 'Review individual symptom recordings to track progress.'
      },
      {
        completed: false,
        title: 'Resources',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      },
      {
        completed: false,
        title: 'Care Team',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      }
    ],
    onBoardingDone: false,
  }
}
else {
  initialState = {
    // to skip start dose flow set as false
    firstTimeDose: false,
    // to skip welcome flow just fill the date of the doses
    // to skip start dose flow just fill body part and marked properties of the doses
    doses: [
      {
        marked: true,
        date: new Date(moment.now()),
        bodyPartInjected: 'top-left',
        notes: null, // { painful: 2, mood: 3, symptoms: ['Redness', 'Itching'], note: 'Custom Note', }
      },
      {
        marked: false,
        date: new Date(moment().add(1, 'week').calendar()),
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: new Date(moment().add(2, 'week').calendar()),
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: new Date(moment().add(3, 'week').calendar()),
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: new Date(moment().add(5, 'week').calendar()),
        bodyPartInjected: '',
        notes: null,
      },
      {
        marked: false,
        date: new Date(moment().add(7, 'week').calendar()),
        bodyPartInjected: '',
        notes: null,
      }
    ],
    bodyPartSelected: '',
    dosingStarted: false,
    timeTravelingDemoDone: false,
    flareUpsDemoDone: false,
    // to skip start dose flow just set as true
    allCompletedDoses: false,
    // fill up if you need data in the symptom reporter feature on activity module
    onBoardingTasks: [
      {
        completed: false,
        title: 'Activity Calendar',
        description: 'This calendar tracks doses and flareups and reminders.',
      },
      {
        completed: false,
        title: 'Activity Dose Report',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      },
      {
        completed: false,
        title: 'Activity Progress',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      },
      {
        completed: false,
        title: 'Activity Symptom Report',
        description: 'Review individual symptom recordings to track progress.'
      },
      {
        completed: false,
        title: 'Resources',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      },
      {
        completed: false,
        title: 'Care Team',
        description: 'Make a note of your symptoms to see Theryx® at work.'
      }
    ],
    onBoardingDone: false,
  }
}

export { initialState };
