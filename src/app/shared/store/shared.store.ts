export interface SharedState {
  backdropConfig?: any;
  sliderPageConfig?: any;
  alertConfig?: any;
  bottomToolbarConfig?: any;
  topbarConfig: any;
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
    showBackButton: true,
    highlights: null,
    contentCentered: false,
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
  alertConfig: {
    show: false,
    mode: 'move',
    template: null,
    component: null,
  },
  bottomToolbarConfig: {
    show: true,
  },
  topbarConfig: {
    bgColor: '--color-white',
    pendingNotifications: 0,
  }
}
