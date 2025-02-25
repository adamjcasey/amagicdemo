import * as fromPages from './pages';

export default [
  {
    path: '',
    component: fromPages.ActivityPage,
  },
  {
    path: 'calendar',
    component: fromPages.CalendarPage,
  },
  {
    path: 'dose-report',
    component: fromPages.DoseReportPage,
  },
  {
    path: 'dose-report-detail',
    component: fromPages.DoseReportDetailPage,
  },
  {
    path: 'your-progress',
    component: fromPages.YourProgressPage,
  },
  {
    path: 'symptom-report',
    component: fromPages.SymptomReportPage,
  },
];
