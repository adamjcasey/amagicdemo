import * as fromPages from './pages';

export default [
  {
    path: '',
    component: fromPages.HomePage,
  },
  {
    path: 'start-dose/prepare',
    component: fromPages.StartDosePreparePage,
  },
  {
    path: 'start-dose/ready-to-inject',
    component: fromPages.StartDoseReadyToInjectPage,
  },
  {
    path: 'start-dose/inject-done',
    component: fromPages.StartDoseInjectDonePage,
  },
];
