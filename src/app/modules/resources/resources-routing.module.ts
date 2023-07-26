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
    path: 'your-care-team/add',
    component: fromPages.YourCareTeamAddPage
  },
  {
    path: 'your-care-team/one',
    component: fromPages.YourCareTeamOnePage
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
    path: 'headspace',
    component: fromPages.HeadspacePage
  },  
  {
    path: 'one-path',
    component: fromPages.OnePathPage
  },  
  {
    path: 'community-feed',
    component: fromPages.CommunityFeedPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {}
