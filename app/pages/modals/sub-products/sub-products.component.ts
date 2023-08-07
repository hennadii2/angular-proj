import { Component, OnInit, ViewEncapsulation, Input, ViewChild, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';
import { PackingService } from 'src/app/shared/services/packing.service';
import { PackingProduct, PackingProductField } from '../../packing/packing.model';
import { NbToastrService } from '@nebular/theme';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { GridSelectionMode } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';

const ROW_HEIGHT = 55;

@Component({
  selector: 'app-modal-sub-products',
  templateUrl: './sub-products.component.html',
	styleUrls: ['./sub-products.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalSubProductsComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	GridSelectionMode = GridSelectionMode;
	ROW_HEIGHT = ROW_HEIGHT;

	products: PackingProduct[]=[];
	button_corner: number;

	dataFields: any = [
		{ name: PackingProductField.id, 		type: 'int' },
		{ name: PackingProductField.hoev, 		type: 'int' },
		{ name: PackingProductField.scan, 		type: 'int' },
		{ name: PackingProductField.art_nummer, type: 'string' },
		{ name: PackingProductField.omschr_new, type: 'string' },
        { name: PackingProductField.locatie, 	type: 'string' },
        { name: PackingProductField.production, type: 'bool' }
	];

	columns: any[] =
    [
		{ text: 'id', 			datafield: PackingProductField.id,          hidden: true},
		{ text: 'Aantal', 		datafield: PackingProductField.hoev, 		width: 80, filtertype: 'number'},
		{ text: 'Ref .', 		datafield: PackingProductField.art_nummer, 	filtertype: 'input'},
        { text: 'Gescand', 		datafield: PackingProductField.scan, 		width: 80, filtertype: 'number' },
        { text: 'Omschrijving', datafield: PackingProductField.omschr_new, 	hidden: true, filtertype: 'input' },
		{ text: 'Lotnr', 		datafield: PackingProductField.locatie, 	width: 120, filtertype: 'input' }
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

	getSubProducts(product: PackingProduct) {
		this.packingService.getSubProducts(product.art_nummer, product.hoev).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
				return;
			}
			
			product.children = res.data;
			let index = this.products.findIndex(p => p.id == product.id);
			if (index == this.products.length - 1) {
				this.generateSource();
			}

		}, err=>{
			this.toastrService.danger(err.message, 'Error');
		})
	}


	getAllSubProducts() {
		this.products.forEach((product, index)=>{
			this.getSubProducts(product);
		});
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
           localData: this.products
		};
		
		this.dataAdapter = new jqx.dataAdapter(source);
	}


	gridReady = (): void => {
	}

	hasSelectedRows() {
		let indexes:number[] = this.jqxGrid.getselectedrowindexes();

		return indexes.length > 0;
	}

	select() {
		let indexes:number[] = this.jqxGrid.getselectedrowindexes();
	
		let rows = this.jqxGrid.getrows();

		let selectedProducts = [];
		rows.forEach((row, index)=>{
			if (indexes.indexOf(index) > -1) {
				let product = this.products.find(i => i.id == row.id);
				selectedProducts.push(product)
			}
		});

		this.activeModal.close(selectedProducts);
	}



	exit() {
		this.activeModal.close();
	}

	onRowDoubleClick(event) {
		// let rowData = event.args.row.bounddata;
		// let product = this.products.find(i => i.id == rowData.id);

		// this.activeModal.close(product);
	}
}
