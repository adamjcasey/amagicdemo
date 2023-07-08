export interface HomeState {
    firstTimeDose: boolean;
    survey: any;
}

export const initialState: HomeState = {
    firstTimeDose: true,
    survey: null,
}
