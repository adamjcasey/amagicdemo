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
    header: true,
    template: null,
    component: null,
    controls: {
      template: null,
      buttonLabel: null,
      buttonAction: null,
    }
  }
}
