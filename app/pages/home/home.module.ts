import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabModule } from 'src/app/tab/tab.module';
import { PackingModule } from '../packing/packing.module';

@NgModule({
    declarations: [
        HomeComponent
    ],
    imports     : [
        SharedModule,
        TabModule,
        PackingModule
    ],
    exports     : [
        HomeComponent
    ]
})

export class HomeModule{
}
