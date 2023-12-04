import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as fromPages from './pages';
import {CommonModule} from "@angular/common";

const routes: Routes = [
  {
    path: '',
    component: fromPages.WelcomePage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WelcomeRoutingModule {}
