import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import {
  CoreEffects,
  CoreReducer,
  LayoutReducer,
  metaReducers,
} from '@app/core/store';
import { HomeEffects, HomeReducer } from '@app/modules/home/store';
import { SharedEffects, SharedReducer } from '../store';
import { WelcomeEffects, WelcomeReducer } from '@app/modules/welcome/store';
import { ActivityEffects, ActivityReducer } from '@app/modules/activity/store';
import { SettingsEffects, SettingsReducer } from '@app/modules/settings/store';
import {
  ResourcesEffects,
  ResourcesReducer,
} from '@app/modules/resources/store';
import { createMiddlewareReducer } from './meta-reducers';

export function provideAppStore() {
  const storage = new Storage({ name: 'automagic_ally' });

  return [
    provideStore(CoreReducer, {
      metaReducers: [...metaReducers, createMiddlewareReducer(storage)],
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
        strictActionWithinNgZone: true,
        strictActionTypeUniqueness: true,
      },
    }),

    provideState('layout', LayoutReducer),
    provideState('home', HomeReducer),
    provideState('shared', SharedReducer),
    provideState('welcome', WelcomeReducer),
    provideState('activity', ActivityReducer),
    provideState('settings', SettingsReducer),
    provideState('resources', ResourcesReducer),

    provideEffects([
      CoreEffects,
      HomeEffects,
      SharedEffects,
      WelcomeEffects,
      ActivityEffects,
      SettingsEffects,
      ResourcesEffects,
    ]),

    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      connectInZone: true,
      trace: !environment.production,
      traceLimit: 75,
    }),

    {
      provide: Storage,
      useFactory: () => {
        storage.create();
        return storage;
      },
    },
  ];
}
