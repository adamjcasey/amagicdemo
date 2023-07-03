export interface SharedState {
  backdropConfig?: any;
  sliderPageConfig?: any;
}

export const initialState: SharedState = {
  backdropConfig: {
    show: false,
    fullScreen: false,
    bgTemplate: null,
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
