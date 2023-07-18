export interface HomeState {
  firstTimeDose: boolean;
  doses: any[];
  reports: any[];
  survey: any;
  timeTravelingDemoDone: boolean;
  flareUpsDemoDone: boolean;
  allCompletedDoses: boolean;
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
  survey: null,
  reports: [],
  timeTravelingDemoDone: false,
  flareUpsDemoDone: false,
  allCompletedDoses: false,
}
