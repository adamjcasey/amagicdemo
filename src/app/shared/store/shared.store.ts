export interface SharedState {
  backdropConfig?: object;
}

export const initialState: SharedState = {
  backdropConfig: {
    show: false,
    fullScreen: false,
    transition: 'move',
    header: true,
    template: null,
    component: null,
  }
}
