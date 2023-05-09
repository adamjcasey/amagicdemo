import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import * as fromPages from './pages';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        loadChildren: () => import('src/app/modules/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'activity',
        loadChildren: () => import('src/app/modules/activity/activity.module').then(m => m.ActivityModule)
      },
      {
        path: 'resources',
        loadChildren: () => import('src/app/modules/resources/resources.module').then(m => m.ResourcesModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('src/app/modules/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'styleguide',
    loadChildren: () => import('src/app/modules/styleguide/styleguide.module').then( m => m.StyleguideModule)
  },
  // Handler error
  { path: '**', component: fromPages.ErrorPage }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class CoreRouting { }
