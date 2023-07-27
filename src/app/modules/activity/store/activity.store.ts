import { environment } from 'src/environments/environment';
import * as moment from 'moment';

export interface ActivityState {
  doseReportSelected: any;
  symptomReports: any;
  symptomReportSelected?: any;
  currentSymptomCreating?: any;
  calendarPageVisited: boolean;
  doseReportsPageVisited: boolean;
  yourProgressPageVisited: boolean;
  symptomReportPageVisited: boolean;
}

let initialState: ActivityState;
if (environment.production) {
  initialState = {
    doseReportSelected: {
      marked: null,
      date: null,
      bodyPart: null,
      numberDose: null,
    },
    symptomReports: [],
    calendarPageVisited: false,
    doseReportsPageVisited: false,
    yourProgressPageVisited: false,
    symptomReportPageVisited: false,
  }
}
else {
  initialState = {
    doseReportSelected: {
      marked: null,
      date: null,
      bodyPart: null,
      numberDose: null,
    },
    symptomReports: [
      {
        date: new Date(moment().toString()),
        feelingOverall: 1,
        customNote: 'Custom Note',
        symptoms: ['Bloating', 'Nausea'],
        severity: 3,
        energyLevels: 5,
        sleepQuality: 2,
        notes: 'Custom Notes',
      },
      {
        date: new Date(moment().add('1', 'week').toString()),
        feelingOverall: 5,
        customNote: 'Custom Note',
        symptoms: ['Indigestion', 'Acid Reflux'],
        severity: 2,
        energyLevels: 3,
        sleepQuality: 4,
      },
      {
        date: new Date(moment().add('2', 'week').toString()),
        feelingOverall: 3,
        customNote: 'Custom Note',
        symptoms: ['Diarrhea', 'Bloating'],
        severity: 1,
        energyLevels: 5,
        sleepQuality: 3,
        notes: 'Custom Notes',
      },
      {
        date: new Date(moment().add('3', 'week').toString()),
        feelingOverall: 2,
        customNote: 'Custom Note',
        symptoms: ['Nausea', 'Indigestion'],
        severity: 3,
        energyLevels: 1,
        sleepQuality: 5,
      },
      {
        date: new Date(moment().add('4', 'weeks').toString()),
        feelingOverall: 1,
        customNote: 'Custom Note',
        symptoms: ['Acid Reflux', 'Diarrhea'],
        severity: 2,
        energyLevels: 3,
        sleepQuality: 3,
        notes: 'Custom Notes',
      }
    ],
    calendarPageVisited: false,
    doseReportsPageVisited: false,
    yourProgressPageVisited: false,
    symptomReportPageVisited: false,
  }
}

export { initialState }
