import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { HttpClientModule, HttpClientJsonpModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularResizedEventModule } from 'angular-resize-event';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskModule } from 'ngx-mask';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ColorPickerModule } from 'ngx-color-picker';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TagInputModule } from 'ngx-chips';

import { TreeModule } from 'angular-tree-component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ShowErrorsModule } from './validators/show-errors/show-errors.module';
import { TranslateModule } from '@ngx-translate/core';

import { WebDataRocksPivot } from "../webdatarocks/webdatarocks.angular4";

import { ModalConfirmComponent } from './modals/confirm/confirm.component';
import { AuthenticationModule } from './authentication/authentication.module';
import { ModalSelectCompanyComponent } from './modals/select-company/select-company.component';
import { CompanyService } from './services/company.service';
import { DataDrivenService } from './services/data-driven.service';
import { DataDrivenFormComponent } from './components/data-driven/form/form.component';
import { DataDrivenGridComponent } from './components/data-driven/grid/grid.component';
import { ThemeModule } from '../@theme/theme.module';
import { DataDrivenButtonsComponent } from './components/data-driven/buttons/buttons.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { JqxModule } from './jqx.module';
import { DataDrivenTabFormComponent } from './components/data-driven/tabform/tabform.component';
import { NgbDateCustomParserFormatter } from './providers/ngb-date-custom-parser-formatter';
import { NgbDateCustomAdapter } from './providers/ngb-date-customer-adapter';
import { DataDrivenChartComponent } from './components/data-driven/chart/chart.component';
import { DataDrivenFormSetComponent } from './components/data-driven/formset/formset.component';
import { DataDrivenModalFormSetComponent } from './components/data-driven/modal/formset/formset.component';
import { DataDrivenModalWebPageComponent } from './components/data-driven/modal/modal-web-page/modal-web-page.component';
import { ShowServerErrorModule } from './validators/show-server-error/show-server-error.module';
import { DataDrivenKanbanComponent } from './components/data-driven/kanban/kanban.component';
import { DataDrivenModalEditKanbanComponent } from './components/data-driven/modal/edit-kanban/edit-kanban.component';
import { SignatureComponent } from './components/signature/signature.component';
import { DeviceInfoComponent } from './components/device-info/device-info.component';
import { WebPageComponent } from './components/web-page/web-page.component';
import { DrawComponent } from './components/draw/draw.component';
import { ModalDeviceInfoComponent } from './modals/device-info/device-info.component';
import { ModalPivotTableComponent } from './modals/pivot-table/pivot-table.component';
import { PivotTableComponent } from './components/pivot-table/pivot-table.component';
import { ImageCropperUploadComponent } from './components/image-cropper-upload/image-cropper-upload.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { DataDrivenSchedulerComponent } from './components/data-driven/scheduler/scheduler.component';
import { DataDrivenTimelineComponent } from './components/data-driven/timeline/timeline.component';
import { NgbModule, NgbDropdown, NgbDateParserFormatter, NgbDateAdapter } from './ng-bootstrap';
import { DataDrivenModalEditSchedulerComponent } from './components/data-driven/modal/edit-scheduler/edit-scheduler.component';
import { DataDrivenTreeGridComponent } from './components/data-driven/treegrid/treegrid.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { OnReturnDirective } from './directives/on-return.directive';
import { OnArrowDirective } from './directives/on-arrow.directive';
import { OnTabDirective } from './directives/on-tab.directive';

import { ModalCalculatorComponent } from './modals/calculator/calculator.component';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { PackingService } from './services/packing.service';
import { NumKeypadComponent } from './components/num-keypad/num-keypad.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ModalAlertModule } from './modals/alert/alert.module';
import { FileService } from './services/file.service';
import { DataDrivenPDFViewComponent } from './components/data-driven/pdfview/pdfview.component';
import { AutocompleteDirective } from './directives/autofill.directive';



@NgModule({
    declarations   : [
        WebDataRocksPivot,
        DeviceInfoComponent,
        WebPageComponent,
        PivotTableComponent,
        CalculatorComponent,
        NumKeypadComponent,
        SignatureComponent,
        DrawComponent,
        ImageUploadComponent,
        ImageCropperUploadComponent,
        FileUploadComponent,
        InventoryComponent,

        ModalConfirmComponent,
        ModalCalculatorComponent,
        ModalSelectCompanyComponent,
        ModalDeviceInfoComponent,
        ModalPivotTableComponent,
        
        DataDrivenButtonsComponent,
        DataDrivenFormComponent,
        DataDrivenGridComponent,
        DataDrivenTreeGridComponent,
        DataDrivenTabFormComponent,
        DataDrivenChartComponent,
        DataDrivenKanbanComponent,
        DataDrivenSchedulerComponent,
        DataDrivenFormSetComponent,
        DataDrivenTimelineComponent,
        DataDrivenPDFViewComponent,

        DataDrivenModalEditKanbanComponent,
        DataDrivenModalEditSchedulerComponent,
        DataDrivenModalFormSetComponent,
        DataDrivenModalWebPageComponent,

        OnReturnDirective,
        OnArrowDirective,
        OnTabDirective,
        AutocompleteDirective 
        
    ],
    imports        : [
        CommonModule,
        FormsModule,
        DragDropModule,
        AuthenticationModule,
        TranslateModule,
        HttpClientModule,
        HttpClientJsonpModule,

        ReactiveFormsModule,
        NgSelectModule,
        NgxMaskModule.forRoot({}),
        DeviceDetectorModule.forRoot(), 
        SignaturePadModule,
        ColorPickerModule,
        ImageCropperModule,

        NgbModule,
        TreeModule.forRoot(),
        NgxChartsModule,
        NgxDatatableModule,
        NgxMaterialTimepickerModule.forRoot(),
        TagInputModule,
        AngularResizedEventModule,
        
        ShowErrorsModule,
        ShowServerErrorModule,
        
        ThemeModule,
        JqxModule,

        ModalAlertModule,
    ],
    exports        : [
        CommonModule,
        TranslateModule,
        FormsModule,
        DragDropModule,
        AuthenticationModule,
        ReactiveFormsModule,
        NgSelectModule,
        NgbModule,
        TreeModule,
        NgxChartsModule,
        NgxDatatableModule,
        TagInputModule,
        JqxModule,
        NgxMaskModule,
        DeviceDetectorModule,
        SignaturePadModule,
        ColorPickerModule,
        ImageCropperModule,
        InventoryComponent,
        ShowErrorsModule,
        ShowServerErrorModule,
        
        WebDataRocksPivot,
        DeviceInfoComponent,
        WebPageComponent,
        PivotTableComponent,
        CalculatorComponent,
        NumKeypadComponent,
        SignatureComponent,
        DrawComponent,
        ImageUploadComponent,
        ImageCropperUploadComponent,
        FileUploadComponent,
        ModalConfirmComponent,
        ModalSelectCompanyComponent,
        ModalDeviceInfoComponent,
        ModalCalculatorComponent,
        ModalPivotTableComponent,
        
        DataDrivenButtonsComponent,
        DataDrivenFormComponent,
        DataDrivenGridComponent,
        DataDrivenTreeGridComponent,
        DataDrivenTabFormComponent,
        DataDrivenChartComponent,
        DataDrivenKanbanComponent,
        DataDrivenSchedulerComponent,
        DataDrivenPDFViewComponent,
        DataDrivenFormSetComponent,
        DataDrivenModalFormSetComponent,
        DataDrivenModalWebPageComponent,
        DataDrivenModalEditKanbanComponent,
        DataDrivenModalEditSchedulerComponent,

        OnReturnDirective,
        OnArrowDirective,
        OnTabDirective,
        AutocompleteDirective
    ],
    entryComponents: [
        ModalDeviceInfoComponent,
        ModalCalculatorComponent,
        ModalConfirmComponent,
        ModalSelectCompanyComponent,
        ModalPivotTableComponent,
        DataDrivenModalEditKanbanComponent,
        DataDrivenModalEditSchedulerComponent,
        DataDrivenModalFormSetComponent,
        DataDrivenModalWebPageComponent,
    ],
    providers      : [
        NgbDropdown,
        CompanyService,
        FileService,
        DataDrivenService,
        PackingService,
        {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter},
        {provide: NgbDateAdapter, useClass: NgbDateCustomAdapter}

    ]
})

export class SharedModule{
}
