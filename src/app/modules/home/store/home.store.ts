export interface HomeState {
  firstTimeDose: boolean;
  doses: any[];
  reports: any[];
  survey: any;
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
  flareUpsDemoDone: false,
}
