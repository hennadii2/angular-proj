import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAlertComponent } from './alert.component';

@NgModule({
    declarations: [
        ModalAlertComponent
    ],
    imports: [],
    exports: [
        ModalAlertComponent,
     ],
     entryComponents: [
        ModalAlertComponent,

    ]
})
export class ModalAlertModule {
}