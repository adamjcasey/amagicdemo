import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as fromPages from './pages';

const routes: Routes = [
  {
    path: '',
    component: fromPages.ResourcesPage
  },
  {
    path: 'your-care-team',
    loadChildren: () => import('./pages/your-care-team/your-care-team.module').then( m => m.YourCareTeamPageModule)
  },
  {
    path: 'your-care-team-add',
    loadChildren: () => import('./pages/your-care-team-add/your-care-team-add.module').then( m => m.YourCareTeamAddPageModule)
  },
  {
    path: 'your-care-team-one',
    loadChildren: () => import('./pages/your-care-team-one/your-care-team-one.module').then( m => m.YourCareTeamOnePageModule)
  },
  {
    path: 'community-feed',
    loadChildren: () => import('./pages/community-feed/community-feed.module').then( m => m.CommunityFeedPageModule)
  },
  {
    path: 'education',
    loadChildren: () => import('./pages/education/education.module').then( m => m.EducationPageModule)
  },
  {
    path: 'one-path',
    loadChildren: () => import('./pages/one-path/one-path.module').then( m => m.OnePathPageModule)
  },
  {
    path: 'mindful-assistant',
    loadChildren: () => import('./pages/mindful-assistant/mindful-assistant.module').then( m => m.MindfulAssistantPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {}
