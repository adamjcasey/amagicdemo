export interface HomeState {
  firstTimeDose: boolean;
  doses: any[];
  survey: any;
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
}
