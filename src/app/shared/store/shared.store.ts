export interface SharedState {
  backdropConfig?: any;
  sliderPageConfig?: any;
  alertConfig?: any;
  bottomToolbarConfig?: any;
  topbarConfig: any;
}

export const initialState: SharedState = {
  alertConfig: {
    show: false,
    mode: 'move',
    template: null,
    component: null,
  },
  backdropConfig: {
    show: false,
    fullScreen: false,
    bgTemplate: null,
    transition: 'move',
    header: true,
    template: null,
    component: null,
    showBackButton: true,
    highlights: null,
    contentCentered: false,
  },
  bottomToolbarConfig: {
    show: true,
  },
  topbarConfig: {
    bgColor: '--color-white',
    pendingNotifications: 0,
  },
  sliderPageConfig: {
    header: {
      fullSize: false,
      color: null,
      template: null,
      component: null,
    },
    content: {
      hide: false,
      bgColor: null,
      template: null,
      component: null,
      actions: null,
      isExpanded: false,
      toolbar: null,
    },
  },
}
