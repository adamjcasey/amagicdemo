export interface SharedState {
  backdropTopConfig?: object;
  backdropBottomConfig?: object;
}

export const initialState: SharedState = {
  backdropTopConfig: {
    show: false,
    fullScreen: false,
    transition: 'move',
    header: true,
    template: null,
    component: null,
  },
  backdropBottomConfig: {
    show: false,
    template: null,
    component: null,
    toolbar: null
  }
}
