export interface HomeState {
  firstTimeDose: boolean;
  doses: any[];
  reports: any[];
  survey: any;
  timeTravelingDemoDone: boolean;
  flareUpsDemoDone: boolean;
}

export const initialState: HomeState = {
  firstTimeDose: true,
  doses: [
    {
      marked: false,
      date: '',
    },
    {
      marked: false,
      date: '',
    },
    {
      marked: false,
      date: '',
    },
    {
      marked: false,
      date: '',
    },
    {
      marked: false,
      date: '',
    },
    {
      marked: false,
      date: '',
    }
  ],
  survey: null,
  reports: [],
  timeTravelingDemoDone: false,
  flareUpsDemoDone: false,
}
