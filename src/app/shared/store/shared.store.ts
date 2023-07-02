export interface SharedState {
  backdropConfig?: object;
  sliderPageConfig?: object;
}

export const initialState: SharedState = {
  backdropConfig: {
    show: false,
    fullScreen: false,
    transition: 'move',
    header: true,
    template: null,
    component: null,
  },
  sliderPageConfig: {
    content: {
      isExpanded: false,
      bgColor: null,
      template: null,
      component: null,
      toolbar: null,
    },
  },
}
