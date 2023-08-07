import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { TabModule } from 'src/app/tab/tab.module';
import { SidebarMenuComponent } from './sidebar-menu.component';



@NgModule({
    declarations: [
        SidebarMenuComponent
    ],
    imports     : [
        SharedModule,
        TabModule
    ],

    exports     : [
        SidebarMenuComponent
    ]
})

export class SideBarModule{
}
