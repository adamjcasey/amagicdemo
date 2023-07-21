export interface HomeState {
  firstTimeDose: boolean;
  doses: any[];
  bodyPartSelected: string;
  doseNotes: any;
  timeTravelingDemoDone: boolean;
  flareUpsDemoDone: boolean;
  allCompletedDoses: boolean;
  symptomReports: any[];
  onBoardingTasks: any[];
}

export const initialState: HomeState = {
  firstTimeDose: true,
  doses: [
    {
      marked: false,
      date: '',
      bodyPart: '',
    },
    {
      marked: false,
      date: '',
      bodyPart: '',
    },
    {
      marked: false,
      date: '',
      bodyPart: '',
    },
    {
      marked: false,
      date: '',
      bodyPart: '',
    },
    {
      marked: false,
      date: '',
      bodyPart: '',
    },
    {
      marked: false,
      date: '',
      bodyPart: '',
    }
  ],
  bodyPartSelected: '',
  doseNotes: null,
  
  timeTravelingDemoDone: false,
  flareUpsDemoDone: false,
  allCompletedDoses: false,
  symptomReports: [],
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
}
