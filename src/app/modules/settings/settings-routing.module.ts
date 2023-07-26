import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as fromPages from './pages';

const routes: Routes = [
  {
    path: '',
    component: fromPages.SettingsPage
  },
  {
    path: 'manage-refill-delivery',
    component: fromPages.ManageRefillDeliveryPage
  },
  {
    path: 'setup-reminders',
    component: fromPages.SetupRemindersPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
