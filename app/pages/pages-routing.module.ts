import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { MiscellaneousComponent } from './miscellaneous/miscellaneous.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'home',
      component: HomeComponent,
      pathMatch: 'full'
    },
    {
      path: 'miscellaneous',
      component: MiscellaneousComponent,
      pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    } 
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
