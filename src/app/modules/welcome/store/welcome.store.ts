export interface WelcomeState {
  name?: string;
  doses?: Array<Date>;
}

export const initialState: WelcomeState = {
  name: '',
  doses: []
}
