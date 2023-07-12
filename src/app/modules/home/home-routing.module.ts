import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as fromPages from './pages';

const routes: Routes = [
  {
    path: '',
    component: fromPages.HomePage
  },
  {
    path: 'start-dose/prepare',
    component: fromPages.StartDosePreparePage
  },
  {
    path: 'start-dose/ready-to-inject',
    component: fromPages.StartDoseReadyToInjectPage
  },
  {
    path: 'start-dose/inject-done',
    component: fromPages.StartDoseInjectDonePage
  },
  {
    path: 'add-symptom',
    component: fromPages.AddSymptomPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
