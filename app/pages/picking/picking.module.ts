import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabModule } from 'src/app/tab/tab.module';
import { PickingSearchComponent } from './search/search.component';
import { ThemeModule } from 'src/app/@theme/theme.module';

import { PickingComponent } from './picking.component';



@NgModule({
    declarations: [
        PickingComponent,
        PickingSearchComponent
    ],
    imports     : [
        SharedModule,
        TabModule,
        ThemeModule
    ],
    exports     : [
        PickingComponent,
        PickingSearchComponent
    ],
    entryComponents: [
    ]
})

export class PickingModule{
}
