import * as fromPages from './pages';

export default [
  {
    path: '',
    component: fromPages.SettingsPage,
  },
  {
    path: 'manage-refill-delivery',
    component: fromPages.ManageRefillDeliveryPage,
  },
  {
    path: 'setup-reminders',
    component: fromPages.SetupRemindersPage,
  },
];
