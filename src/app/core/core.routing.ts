import { Routes } from '@angular/router';

import * as fromPages from './pages';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('src/app/modules/welcome/welcome-routing.module'),
  },
  {
    path: '',
    children: [
      {
        path: 'home',
        loadChildren: () => import('src/app/modules/home/home-routing.module'),
      },
      {
        path: 'activity',
        loadChildren: () =>
          import('src/app/modules/activity/activity-routing.module'),
      },
      {
        path: 'resources',
        loadChildren: () =>
          import('src/app/modules/resources/resources-routing.module'),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('src/app/modules/settings/settings-routing.module'),
      },
    ],
  },
  {
    path: 'notifications',
    component: fromPages.NotificationsPage,
  },
  {
    path: 'symptoms/add',
    component: fromPages.AddSymptomPage,
  },

  // Handler errors
  { path: '**', component: fromPages.ErrorPage },
];
