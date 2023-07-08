export interface SharedState {
  backdropConfig?: any;
  sliderPageConfig?: any;
  alertConfig?: any;
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
    backButton: null,
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
  alertConfig: {
    show: false,
    mode: 'move',
    template: null,
    component: null,
  },
}
