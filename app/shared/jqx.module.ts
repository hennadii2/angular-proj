import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { jqxDateTimeInputModule } from 'jqwidgets-ng/jqxdatetimeinput';
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { jqxTreeGridModule } from 'jqwidgets-ng/jqxtreegrid';
import { jqxChartModule } from 'jqwidgets-ng/jqxchart';
import { jqxMenuModule } from 'jqwidgets-ng/jqxmenu';
import { jqxKanbanModule } from 'jqwidgets-ng/jqxkanban';
import { jqxSchedulerModule } from 'jqwidgets-ng/jqxscheduler';
import { jqxDragDropModule } from 'jqwidgets-ng/jqxdragdrop';
import { jqxDropDownListModule } from 'jqwidgets-ng/jqxdropdownlist';


@NgModule({
    declarations   : [
    ],
    imports        : [
        CommonModule,
        FormsModule,

        jqxDateTimeInputModule, 
        jqxGridModule,
        jqxTreeGridModule,
        jqxChartModule,
        jqxMenuModule,
        jqxKanbanModule,
        jqxSchedulerModule,
        jqxDragDropModule,
        jqxDropDownListModule
    ],
    exports        : [
        jqxDateTimeInputModule, 
        jqxGridModule,
        jqxTreeGridModule,
        jqxChartModule,
        jqxMenuModule,
        jqxKanbanModule,
        jqxSchedulerModule,
        jqxDragDropModule,
        jqxDropDownListModule
    ],
    entryComponents: [
    ],
    providers      : [
    ]
})

export class JqxModule{
}
