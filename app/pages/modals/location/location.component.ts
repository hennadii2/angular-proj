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
  selector: 'app-modal-location',
  templateUrl: './location.component.html',
	styleUrls: ['./location.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalLocationComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	PackingProductField = PackingProductField;
	ROW_HEIGHT = ROW_HEIGHT;
	GridSelectionMode = GridSelectionMode;

	@Input() art_nummer;
	@Input() location;
	@Input() omschr_new;
	@Input() show_all: boolean = false;

	button_corner: number;

	source: any = null;
	gridAdapter: any;
	@ViewChild('jqxGrid') jqxGrid: jqxGridComponent;

	gridCellClass = (row: number, columnfield: any, value: number): string => {
		let rowData = this.jqxGrid.getrowdata(row);
		let selected = rowData['maat'] && this.location && rowData['maat'].trim() == this.location.trim();
		
		if (selected) {
            return `bg-success`;
        } else { 
            return ``;
        }
	}

	dataFields: any = [
		{ name: "id", 		type: 'string' },
		{ name: "maat", 		type: 'string' },
		{ name: "hoev", 		type: 'number' },
		{ name: "vrij", 		type: 'string' }
	];

	columns: any[] =
    [
		{ text: 'id', 	datafield: "id",    hidden: true},
		{ text: 'Maat', datafield: "maat",  filtertype: 'input', cellclassname: this.gridCellClass },
		{ text: 'Hoev', datafield: "hoev",  filtertype: 'number', cellclassname: this.gridCellClass },
		{ text: 'Refdatum', datafield: "vrij",  filtertype: 'input', cellclassname: this.gridCellClass }
	];

	items: any[]=[];

	constructor(
		public activeModal: NgbActiveModal,
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private packingService: PackingService) {
			this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
		if (this.art_nummer != null) this.getLocations(this.art_nummer);
	}

		
	ngOnChanges(changes: SimpleChanges) {
		if (changes['art_nummer']) {

		}
	}

  	getLocations(art_nummer: any) {
		this.packingService.getProductLocations(art_nummer, true).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
				return;
			}
			
			this.items = res.data;
			this.gridGenerateSource();
		}, err=>{
			this.toastrService.danger(err.message, 'Error');
		})
	}

	gridGenerateSource() {
		if (!this.source) {
			this.source = {
				localdata: this.show_all ? this.items : this.items.filter(item=>item.hoev>0),
				datatype: 'array',
				datafields: this.dataFields
			};
			this.gridAdapter = new jqx.dataAdapter(this.source);
		} else {
			this.source.localdata = this.show_all ? this.items : this.items.filter(item=>item.hoev>0);
			this.jqxGrid.updatebounddata('cells');
		}
	}

	getGridWidth() : any {
		return 'calc(100% - 2px)';
	}

	
	gridReady = (): void => {
	}
	
	gridRendered = (type: any): void => {
	}

	onRowDoubleClick(event) {
		let rowData = event.args.row.bounddata;
		let item = this.items.find(i => i.id == rowData.id);

		this.activeModal.close(item);
	}

	changeShowWay() {
		this.show_all = !this.show_all;
		this.gridGenerateSource();
	}

	yes() {
	}
	
	closeModal() {
		this.activeModal.close();
	}
}
