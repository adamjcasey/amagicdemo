export interface SharedState {
  showOverlay: boolean;
  overlayOptions: object;
  overlayContent: any;
}

export const initialState: SharedState = {
  showOverlay: false,
  overlayOptions: {
    transition: 'fade',
    fullScreen: true,
    showHeader: false,
  },
  overlayContent: '',
}
