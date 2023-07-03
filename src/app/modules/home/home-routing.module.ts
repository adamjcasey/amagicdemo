import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as fromPages from './pages';
import * as fromComponents from './components';

const routes: Routes = [
  {
    path: '',
    component: fromPages.HomePage
  },
  {
    path: 'start-dose',
    component: fromComponents.StartDoseComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
