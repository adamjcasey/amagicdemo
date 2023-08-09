import * as moment from 'moment';

import { environment } from 'src/environments/environment';

export interface HomeState {
  firstTimeDose: boolean;
  doses: any[];
  bodyPartSelected: string;
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
        marked: true, // false
        date: new Date(moment().toString()), // '',
        bodyPartInjected: 'top-right', // '', 
        notes: null, // { painful: 2, mood: 3, symptoms: ['Redness', 'Itching'], note: 'Custom Note', }
      },
      {
        marked: true, // false
        date: new Date(moment().add(1, 'weeks').toString()), // '',
        bodyPartInjected: 'top-left', // '', 
        notes: null, // { painful: 3, mood: 1, symptoms: ['Swelling', 'No Reaction'], note: 'Custom Note', }
      },
      {
        marked: true, // false
        date: new Date(moment().add(2, 'weeks').toString()), // '',
        bodyPartInjected: 'bottom-right', // '', 
        notes: null, // { painful: 5, mood: 4, symptoms: ['Redness', 'Itching'], note: 'Custom Note', }
      },
      {
        marked: true, // false
        date: new Date(moment().add(3, 'weeks').toString()), // '',
        bodyPartInjected: 'bottom-left', // '', 
        notes: null, // { painful: 2, mood: 5, symptoms: ['Swelling', 'No Reaction'], note: 'Custom Note', }
      },
      {
        marked: true, // false
        date: new Date(moment().add(5, 'weeks').toString()), // '',
        bodyPartInjected: 'top-right', // '', 
        notes: null, // { painful: 2, mood: 3, symptoms: ['Redness', 'Itching'], note: 'Custom Note', }
      },
      {
        marked: true, // false
        date: new Date(moment().add(7, 'weeks').toString()), // '',
        bodyPartInjected: 'bottom-left', // '', 
        notes: null, // { painful: 1, mood: 4, symptoms: ['Swelling', 'No Reaction'], note: 'Custom Note', }
      }
    ],
    // doses: [
    //   {
    //     marked: false,
    //     date: '',
    //     bodyPartInjected: '',
    //     notes: null,
    //   },
    //   {
    //     marked: false,
    //     date: '',
    //     bodyPartInjected: '',
    //     notes: null,
    //   },
    //   {
    //     marked: false,
    //     date: '',
    //     bodyPartInjected: '',
    //     notes: null,
    //   },
    //   {
    //     marked: false,
    //     date: '',
    //     bodyPartInjected: '',
    //     notes: null,
    //   },
    //   {
    //     marked: false,
    //     date: '',
    //     bodyPartInjected: '',
    //     notes: null,
    //   },
    //   {
    //     marked: false,
    //     date: '',
    //     bodyPartInjected: '',
    //     notes: null,
    //   }
    // ],
    bodyPartSelected: '',
    timeTravelingDemoDone: true,
    flareUpsDemoDone: true,
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
