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
    component: fromPages.YourCareTeamPage
  },
  {
    path: 'your-care-team/list',
    component: fromPages.YourCareTeamListPage
  },
  {
    path: 'your-care-team/detail',
    component: fromPages.YourCareTeamDetailPage
  },
  {
    path: 'community-feed',
    component: fromPages.CommunityFeedPage
  },
  {
    path: 'education',
    component: fromPages.EducationPage
  },  
  {
    path: 'mindful-assistant',
    component: fromPages.MindfulAssistantPage
  },  
  {
    path: 'mindful-assistant/start',
    component: fromPages.MindfulAssistantStartPage
  },  
  {
    path: 'one-path',
    component: fromPages.OnePathPage
  },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {}
