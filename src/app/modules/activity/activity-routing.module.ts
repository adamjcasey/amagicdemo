import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as fromPages from './pages';

const routes: Routes = [
  {
    path: '',
    component: fromPages.ActivityPage
  },
  {
    path: 'calendar',
    component: fromPages.CalendarPage
  },
  {
    path: 'dose-report',
    component: fromPages.DoseReportPage
  },
  {
    path: 'dose-report-detail',
    component: fromPages.DoseReportDetailPage
  },
  {
    path: 'your-progress',
    component: fromPages.YourProgressPage
  },
  {
    path: 'symptom-report',
    component: fromPages.SymptomReportPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityRoutingModule {}
