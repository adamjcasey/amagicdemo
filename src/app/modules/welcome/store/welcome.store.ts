export interface WelcomeState {
  pin?: number;
  name?: string;
  doses?: Array<Date>;
}

export const initialState: WelcomeState = {
  name: '',
  doses: []
}
