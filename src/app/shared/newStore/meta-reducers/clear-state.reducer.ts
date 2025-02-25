import { ActionReducer } from '@ngrx/store';
import { Capacitor } from '@capacitor/core';
import { ActionTypes, CoreState } from '@app/core/store';

export function clearState(reducer: ActionReducer<CoreState>) {
  return function (state: any, action: any) {
    if (action.type === ActionTypes.ClearStore) {
      state = Capacitor.isNativePlatform()
        ? {
            layout: {
              userDevice: state.layout.userDevice
                ? {
                    name: state.layout.userDevice.name,
                    model: state.layout.userDevice.model,
                  }
                : null,
            },
            welcome: {
              bleAllowed: state.welcome.bleAllowed
                ? state.welcome.bleAllowed
                : null,
              notificationsAllowed: state.welcome.notificationsAllowed
                ? state.welcome.notificationsAllowed
                : null,
            },
          }
        : {};
    }
    return reducer(state, action);
  };
}
