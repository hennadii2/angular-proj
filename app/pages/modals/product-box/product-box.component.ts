import { Component, OnInit, ViewEncapsulation, Input, ViewChild, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';
import { PackingService } from 'src/app/shared/services/packing.service';
import { PackingProduct, PackingProductField, PackingProductBox } from '../../packing/packing.model';
import { NbToastrService } from '@nebular/theme';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { GridSelectionMode } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';

const ROW_HEIGHT = 55;

@Component({
  selector: 'app-modal-product-box',
  templateUrl: './product-box.component.html',
	styleUrls: ['./product-box.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalProductBoxComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	GridSelectionMode = GridSelectionMode;
	ROW_HEIGHT = ROW_HEIGHT;

	product_box: PackingProductBox[]=[];
	button_corner: number;
	PackingProductField = PackingProductField;

	descCellRenderer = (row: number, column: any, value: any): any => {	
		let html = 	`<div class="d-flex align-items-center justify-content-between h-100 w-100">
						<span class="ml-2">${value}</span>
						<button type="button" class="btn btn-primary btn-desc-box rounded-0 mr-2"> 
							-
						</button>
					</div>`;

		return html;
	}

	dataFields: any = [
		{ name: "box", 	type: 'int' },
		{ name: "hoev", type: 'int' },
	];

	columns: any[] =
    [
		{ text: 'Box Number', 		datafield: PackingProductField.box,   filtertype: 'number'},
		{ text: 'Quantity', 		datafield: PackingProductField.hoev, 	filtertype: 'number', cellsrenderer:  this.descCellRenderer}
	];

	dataAdapter: any;
	@ViewChild('jqxGrid') jqxGrid: jqxGridComponent;

	constructor(
		public activeModal: NgbActiveModal,
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private packingService: PackingService) {
			this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
		this.generateSource();
	}

		
	ngOnChanges(changes: SimpleChanges) {
	}



	getWidth() : any {
		return 'calc(100% - 2px)';
	}

	generateSource() {
		let source: any =
        {
           dataType: 'json',
           dataFields: this.dataFields,
           id: 'id',
           localData: this.product_box.filter(box=> box.hoev != 0)
		};
		
		this.dataAdapter = new jqx.dataAdapter(source);
	}


	gridReady = (): void => {
	}

	select() {
	}

	exit() {
		this.activeModal.close(this.product_box);
	}

	setDecreaseQuantity(box: number, quantity: number) {
		if (quantity < 1) return;

		let index = this.product_box.findIndex(b=> b.box == box);
		this.product_box[index].hoev = quantity - 1;
		if (!this.jqxGrid) return;

		let items = this.jqxGrid.getrows();
		let grid_index = items.findIndex(item=> item.box == box);
		if (quantity - 1 > 0) {
			
			this.jqxGrid.setcellvalue(grid_index, PackingProductField.hoev, quantity - 1);
		} else {
			this.product_box.splice(index, 1);
			let rid = this.jqxGrid.getrowid(grid_index);
			this.jqxGrid.deleterow(rid);
		}

	}

	onRowDoubleClick(event) {
		this.activeModal.close();
	}

	onCellDoubleClick(event) {
		let args = event.args;
		if (args.datafield == PackingProductField.hoev) {
			let target = args.originalEvent.target;

			let classes = target.getAttribute("class");
			if (classes.indexOf('btn-desc-box') > -1) {
				let boxdata: PackingProductBox = args.row.bounddata;
				this.setDecreaseQuantity(boxdata.box, boxdata.hoev)
			}
		}
	}
}
