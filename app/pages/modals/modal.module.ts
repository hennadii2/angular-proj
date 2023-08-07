import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabModule } from 'src/app/tab/tab.module';
import { ThemeModule } from 'src/app/@theme/theme.module';
import { ModalPackingComponent } from '../modals/packing/packing.component';
import { ModalLocationComponent } from '../modals/location/location.component';
import { ModalSerialComponent } from '../modals/serial/serial.component';

import { ModalPickingComponent } from './picking/picking.component';
import { PackingModule } from '../packing/packing.module';
import { PickingModule } from '../picking/picking.module';
import { ModalPackingWeightComponent } from './packing-weight/packing-weight.component';
import { ModalSubProductsComponent } from './sub-products/sub-products.component';
import { ModalProductBoxComponent } from './product-box/product-box.component';



@NgModule({
    declarations: [
        ModalPackingComponent,
        ModalPickingComponent,
        ModalLocationComponent,
        ModalSerialComponent,
        ModalPackingWeightComponent,
        ModalSubProductsComponent,
        ModalProductBoxComponent

    ],
    imports     : [
        SharedModule,
        TabModule,
        ThemeModule,
        PackingModule,
        PickingModule
    ],
    exports     : [
        ModalPackingComponent,
        ModalPickingComponent,
        ModalLocationComponent,
        ModalSerialComponent,
        ModalPackingWeightComponent,
        ModalSubProductsComponent,
        ModalProductBoxComponent
    ],
    entryComponents: [
      ModalPackingComponent,
      ModalPickingComponent,
      ModalLocationComponent,
      ModalSerialComponent,
      ModalPackingWeightComponent,
      ModalSubProductsComponent,
      ModalProductBoxComponent
    ]
})

export class ModalModule{
}
