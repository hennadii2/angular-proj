import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { HomeModule } from './home/home.module';
import { SideBarModule } from './sidebar-menu/sidebar-menu.module';
import { PackingModule } from './packing/packing.module';
import { PickingModule } from './picking/picking.module';
import { ModalModule } from './modals/modal.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';

const PAGES_COMPONENTS = [
  PagesComponent
];

@NgModule({
  imports: [
    PagesRoutingModule,
    MiscellaneousModule,
    ThemeModule,
    SideBarModule,
    HomeModule,
    PackingModule,
    PickingModule,
    ModalModule
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ]
})
export class PagesModule {
}
