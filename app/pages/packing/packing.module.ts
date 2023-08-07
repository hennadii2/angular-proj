import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabModule } from 'src/app/tab/tab.module';
import { PackingComponent } from './packing.component';
import { PackingSearchComponent } from './search/search.component';
import { PackingWarehouseComponent } from './warehouse/warehouse.component';
import { ThemeModule } from 'src/app/@theme/theme.module';
import { PackingUsersComponent } from './users/users.component';




@NgModule({
    declarations: [
        PackingComponent,
        PackingUsersComponent,
        PackingSearchComponent,
        PackingWarehouseComponent,
    ],
    imports     : [
        SharedModule,
        TabModule,
        ThemeModule
    ],
    exports     : [
        PackingComponent,
        PackingSearchComponent,
        PackingWarehouseComponent,
    ],
    entryComponents: [
    ]
})

export class PackingModule{
}
