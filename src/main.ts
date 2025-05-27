import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from '@angular/router';
import { LayoutPage } from '@app/core';
import { routes } from '@app/core/core.routing';
import { provideAppStore } from '@app/shared/newStore/providers';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

bootstrapApplication(LayoutPage, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'ios',
      innerHTMLTemplatesEnabled: true,
      swipeBackEnabled: false
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideAppStore(),
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
