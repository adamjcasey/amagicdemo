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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
