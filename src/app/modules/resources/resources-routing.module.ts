import * as fromPages from './pages';

export default [
  {
    path: '',
    component: fromPages.ResourcesPage,
  },
  {
    path: 'your-care-team',
    component: fromPages.YourCareTeamPage,
  },
  {
    path: 'your-care-team/list',
    component: fromPages.YourCareTeamListPage,
  },
  {
    path: 'your-care-team/detail',
    component: fromPages.YourCareTeamDetailPage,
  },
  {
    path: 'community-feed',
    component: fromPages.CommunityFeedPage,
  },
  {
    path: 'education',
    component: fromPages.EducationPage,
  },
  {
    path: 'mindful-assistant',
    component: fromPages.MindfulAssistantPage,
  },
  // Old version
  // {
  //   path: 'mindful-assistant/start',
  //   component: fromPages.MindfulAssistantStartPage
  // },
  {
    path: 'one-path',
    component: fromPages.OnePathPage,
  },
];
