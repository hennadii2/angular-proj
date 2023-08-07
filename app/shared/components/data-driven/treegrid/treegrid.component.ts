import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { PageType, ButtonType, OnClick, PageSize, GridShowPosition } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';

import { JqxGridDataType, JqxGridColumnType } from 'src/app/shared/models/jqx.models';
import { DataDrivenModalFormSetComponent } from '../modal/formset/formset.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';

const ID_STR = 'id';
const PARENT_STR = 'parent';
const SEARCH_STR = '?key=';
const DATE_FORMAT = 'dd/MM/yy';
const GRID_MIN_WIDTH = 850;

@Component({
	selector: 'app-data-driven-treegrid',
	templateUrl: './treegrid.component.html',
	styleUrls: ['./treegrid.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DataDrivenTreeGridComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	parseInt = parseInt;
	
	ButtonType = ButtonType;
	objectKeys = Object.keys;
	PageType = PageType;
	PageSize = PageSize;

	@Input() id: any = -1;
	// @Input() rowid: any = -1;
	@Input() endpoint: string;
	@Input() rowrefresh: string;
	@Input() buttons: ButtonType[] = [];
	@Input() disabled_buttons: ButtonType[]=[ButtonType.List];
	@Input() hidefilter: boolean;
	@Input() onclick: OnClick = null;
	@Input() filterStr: string = "";
	@Input() items: any[]=[];
	@Input() pagetype: PageType;
	@Input() title: string;
	@Input() height: number;
	@Input() position: GridShowPosition;
	@Input() isDashboardElement: boolean;

	@Output() onExit = new EventEmitter();
	@Output() onSelect = new EventEmitter();

	@Output() onChangeView = new EventEmitter();
	@Output() onChangeSelectedItem = new EventEmitter();
	@Output() onChangedGridData = new EventEmitter();

	headers: any[]=[];
	filteredItems: any[]=[];
	
	gridAdapter: any = null;
	columns: any[]= null;

	can_set_bottom: boolean = false;
	button_corner: number;
	gridState: any;
	oldFilterStr: string = "";

	@ViewChild('searchInput') searchEl: ElementRef;
	@ViewChild('jqxTreeGrid') jqxTreeGrid: jqxTreeGridComponent;

	componentDestroyed = new Subject(); // Component Destroy
	isDestroyed: boolean = false;
	constructor(
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private deviceService: DeviceDetectorService,
		private modalService: NgbModal,
		private tokenStorage: TokenStorage
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		this.focusSearchInput();
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes[ID_STR] || changes['endpoint'] || changes['onclick']) { // || changes['pagetype'] || changes['filterStr']
			if (this.endpoint && (this.pagetype == PageType.TreeGrid)) {
				// if (this.endpoint.indexOf(SEARCH_STR) > -1) {
				// 	this.getData(this.endpoint, this.id,  this.columns ? false : true);
				// } else {
					
					 if (this.filterStr != null && this.filterStr !="" || this.hidefilter ) { //
						this.getDataWithFilter(this.endpoint, this.id, this.filterStr, this.columns ? false: true, this.position);
					 } else {
					 	this.getStructure(this.endpoint, this.id);
					 }
				// }
			}
		}

		if (changes['pagetype']) {

			// if ((this.pagetype==PageType.Grid || this.pagetype == PageType.TabGrid) && this.rowid && this.rowid != -1) {
			// 	this.selectItemById(this.rowid);
			// }
		}
	}

	ngDoCheck() {

		if (this.can_set_bottom && this.jqxTreeGrid) {
			this.setShowPosition(this.position);
		}

		this.setDisableButtons();
	}

	ngOnDestroy() {
		this.isDestroyed = false;
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}

	getStructure(url: string, id: string) {

		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id);
		let index = passed_url.indexOf('?');
		if (index > -1) passed_url = passed_url.substr(0, index);

		this.dataDrivenService.getGridStructure(passed_url).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}

			this.headers = res.headers;

			this.columns = this.generateColumns(this.headers);

			this.items = [];

			this.setGridHeadersAndItems(this.headers, this.items);

			this.focusSearchInput();
		}, err=>{
			this.toastrService.danger(err.message, "Error");
			this.focusSearchInput();
		});
	}

	getDataWithFilter(url: string, id: string, filterStr: string, is_header: boolean, position: GridShowPosition, start_id: any = null) {

		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id);
		passed_url = `${passed_url}${url.indexOf('?')  > -1 ? '&' : '?'}position=${position}`;

		if (filterStr && filterStr !="" ) passed_url= `${passed_url}${url.indexOf('?')  > -1 ? '&' : '?'}key=${filterStr}`;

		if (start_id) {
			passed_url = `${passed_url}&start=${start_id}`;
		} else {
			this.items = [];
		}


		this.dataDrivenService.getGridData(passed_url, is_header).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}

			if (this.filterStr != filterStr || this.isDestroyed) {
				return;
			}
			
			let resultArr: any[] = res.data;
			let new_start_id: any = null;

			if (position == GridShowPosition.Top) {
				this.items = this.items.concat(resultArr);
			} else if (position == GridShowPosition.Bottom) {
				this.items = resultArr.concat(this.items);
			}
			// this.items = res.data;

			if (res.headers && res.headers.length > 0) {
				this.headers = res.headers;
				this.columns = this.generateColumns(this.headers);
			}

			// this.is_setted = 0;

			this.setGridHeadersAndItems(this.headers, this.items);
			this.focusSearchInput();
			if (res.serverload && resultArr.length > 0) {
				if (position == GridShowPosition.Top) {
					new_start_id = resultArr[resultArr.length-1]['id'];
				} else if (position == GridShowPosition.Bottom) {
					if (resultArr.length > 0) new_start_id = resultArr[0]['id'];
				}

				this.getDataWithFilter(url, id, filterStr, false, this.position, new_start_id);
			} else {
				//this.focusSearchInput();
			}

			if (start_id) {
				this.can_set_bottom = true;
			}
		}, err=>{
			this.toastrService.danger(err.message, "Error");
			this.focusSearchInput();
		});
	}



	deleteItem(url: string, id: string,  itemid: any) {
		
		const modalRef = this.modalService.open(ModalConfirmComponent, {centered: true, draggableSelector: '.modal-header'});

        modalRef.result.then(result=>{
			if (result) {
				let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id);
				let param_index = passed_url.indexOf('?');
		
				if (param_index > -1) passed_url = url.substring(0, param_index);

				this.dataDrivenService.deleteData(`${passed_url}/${itemid}`).subscribe(res=>{
					if (res.error) {
						this.toastrService.danger(res.error.type, "Error");
					} else {
						this.toastrService.success("The item has been deleted successfully!", "Success");
						this.deleteRowFromGrid(itemid);
					}
					//this.search();
	
				}, err=>{
					this.toastrService.danger(err.message, 'Error');
				})
			}
		});
	}


	deleteRowFromGrid(id: any) {
		if (!this.jqxTreeGrid) return;
		let items = this.jqxTreeGrid.getRows();
		let index = items.findIndex(item=> item[ID_STR] == id);
		
		this.jqxTreeGrid.deleteRow(id);
		let new_id = items[index % items.length];

		this.selectItemById(new_id);
	}

	addRowToGrid(item: any) {
		if (!this.jqxTreeGrid) return;
		this.jqxTreeGrid.beginUpdate();
		this.jqxTreeGrid.addRow(null, {}, item);
		this.jqxTreeGrid.endUpdate();

		this.selectItemById(item.id);
	}

	updateRowOfGrid(id: any, item: any) {
		if (!this.jqxTreeGrid) return;
		// let items = this.jqxTreeGrid.getRows();
		// let index = items.findIndex(item=> item.id == id);
		// let rid = this.jqxTreeGrid.getrowid(index);

		this.jqxTreeGrid.updateRow(id, item);
		this.jqxTreeGrid.ensureRowVisible(id);

		//this.selectItemByIndex(index);
	}

	setGridHeadersAndItems(headers: any[], items : any[]) {
		let source = this.generateGridSource(headers, items);
		this.gridAdapter = new jqx.dataAdapter(source);
	}

	focusSearchInput() {
		if (this.searchEl && this.deviceService.isDesktop()) this.searchEl.nativeElement.focus();
	}

	setDisableButtons() {
		this.disabled_buttons = [ButtonType.Save, ButtonType.List];
		if (this.getDiabledModifyButtons()) {
			this.disabled_buttons.push(ButtonType.Edit);
			this.disabled_buttons.push(ButtonType.Delete);
			this.disabled_buttons.push(ButtonType.View);
		}
		
		if (!this.jqxTreeGrid || this.jqxTreeGrid.getSelection().length <= 0) {
			this.disabled_buttons.push(ButtonType.Previous);
			this.disabled_buttons.push(ButtonType.Next);
			this.disabled_buttons.push(ButtonType.Select);
		} else {
			let items = this.jqxTreeGrid.getRows();
			let selItems = this.jqxTreeGrid.getSelection();
			let selItem;
			if (selItems.length > 0) selItem = selItems[0];

			if (this.items.findIndex(item => item[ID_STR] == selItem[ID_STR]) == 0) {

				this.disabled_buttons.push(ButtonType.Previous);
			} 
			if (this.items.findIndex(item => item[ID_STR] == selItem[ID_STR]) == items.length -1) {
				this.disabled_buttons.push(ButtonType.Next);
			} 
		}

	}

	gridReady = (): void => {
		this.can_set_bottom = true;
	   	this.setShowPosition(this.position);
	//    if (this.gridState) {
	// 		setTimeout(()=>{this.jqxTreeGrid.loadstate(this.gridState);}, 0);
	// 		this.gridState = null;
	//    }
    }

	Bindingcomplete(event) {
		this.setShowPosition(this.position);
	}


	generateGridSource(headers: any[], data: any[]) {
		let source: any = {
			localdata: [], 
			datafields: [], 
			datatype: JqxGridDataType,			
			hierarchy:
			{
				keyDataField: { name: 'id' },
				parentDataField: { name: 'parent' }
			},
			id: 'id'};

		if (!headers || this.headers.length == 0) return source;

		let datafields = [];

		let id_datafield = {
			name: ID_STR,
		};
		let parent_datafield = {
			name: PARENT_STR
		}
		
		datafields.push(id_datafield);
		datafields.push(parent_datafield)

		headers.forEach((header, index)=>{
			let datafield = {
				name: header.data,
				type: header.type,
			}
			if (header.type == JqxGridColumnType.Date) datafield['format']=DATE_FORMAT;
			datafields.push(datafield);
		});

		source = {
			localdata: data ? data : [],
			datafields: datafields,
			datatype: JqxGridDataType.Array,
			hierarchy:
			{
				keyDataField: { name: 'id' },
				parentDataField: { name: 'parent' }
			},
			id: 'id',
		}

		return source;
	}

	generateColumns(headers: any[]) {
		let columns = [];
		if (!headers || headers.length == 0) return columns;

		// let id_column = {
		// 	text: ID_STR,
		// 	datafield: ID_STR,
		// 	width: 100
		// };

		// columns.push(id_column);

		headers.forEach((header, index)=>{
			let column = {
				text: header.title,
				datafield: header.data,
				width:  header.width,
			}

			switch (header.type) {
				case JqxGridColumnType.String: 
					column['cellsalign'] = "left";
					column['filtertype'] = "input";
					break;
				case JqxGridColumnType.Number:
				case JqxGridColumnType.Int:
					column['cellsalign'] = "right";
					column['filtertype'] = "number";
					//column['cellsformat'] = 'd';
					break;
				case JqxGridColumnType.Float:
					column['cellsalign'] = "right";
					column['filtertype'] = "number";
					//column['cellsformat'] = 'f2';
					break;
				case JqxGridColumnType.Date:
					column['cellsalign'] = "right";
					column['filtertype'] = "range";
					column['cellsformat'] = DATE_FORMAT;
					break;
				case JqxGridColumnType.CheckBox:
					column['cellsalign'] = "center";
					column['filtertype'] = "bool";
					column['columntype'] = 'checkbox';
			}
			columns.push(column);
		});

		return columns;
		
	}

	getGridWidth() : any {
		if (document.body.offsetWidth > GRID_MIN_WIDTH) {
			return 'calc(100% - 2px)';
		}
		return GRID_MIN_WIDTH;
	}

	getDeferedDataFields() {
		let fields = this.headers.map(header=>header.data);
		return fields;
	}

	getGridRowHeight() {
		if (!this.height || typeof(this.height) != "number"){
			return screen.height / 100.0 * 65;
		} 
		return 100 + 32 * this.height;
	}

	search() {
		if (this.filterStr != this.oldFilterStr) {
			this.getDataWithFilter(this.endpoint, this.id, this.filterStr, this.columns ? false : true, this.position);
			this.oldFilterStr = this.filterStr;
		}
	}

	filterWithFrontEnd() {
		this.filteredItems = this.items.filter( item => {
			for (let i = 0; i < this.headers.length; i++) {
				let column = this.headers[i].data;
				if (item[column] && item[column].toString().toLowerCase().indexOf(this.filterStr ? this.filterStr.trim().toLowerCase() : '') > -1) {
				  	return true;
				}
			}
		});
		
		this.setGridHeadersAndItems(this.headers, this.items);
	}

	focusFilter(event) {
		event.target.select();
	}

	onFilter(event) {
		if (event.keyCode==13) {
			this.search();

		}
	}


	onRowDoubleClicked(event) {
		this.view();
	}

	save() {
	}

	add() {
		if (!this.onclick) return;
		this.switchView(this.onclick, -1);
	}

	view() {
		if (!this.onclick) return;
		let items = this.jqxTreeGrid.getSelection();
		if (items.length > 0) this.switchView(this.onclick, items[0].id);
	}


	delete() {
		let items = this.jqxTreeGrid.getSelection();

		if (items.length > 0) this.deleteItem(this.endpoint, this.id, items[0][ID_STR]);
	}

	switchView(onclick: OnClick, id: any = -1) {
		switch (onclick.pagetype) {
			case PageType.Form:
			case PageType.Chart:
			case PageType.TabForm:
				this.onChangeView.next({page: onclick.pagetype, items: this.items, itemid: id});
				break;
			case PageType.Grid:
				this.onChangeView.next({page: PageType.SubGrid, items: this.items, itemid: id});
				break;
			case PageType.ModalForm:
			case PageType.ModalGrid:
			case PageType.ModalTabForm:
			case PageType.ModalChart:
				this.openModalFormSet(onclick, id);
				break;
		}
	}

	openModalFormSet(onclick: OnClick, id: any = -1) {
		let modal_param = {centered: true, draggableSelector: '.modal-header'};
		if (onclick.pagesize && onclick.pagesize != PageSize.Medium) modal_param['size'] = onclick.pagesize;

        const modalRef = this.modalService.open(DataDrivenModalFormSetComponent, modal_param);

		modalRef.componentInstance.maintype = onclick.pagetype;
		modalRef.componentInstance.pagetype = onclick.pagetype;
		modalRef.componentInstance.title = onclick.title;
		modalRef.componentInstance.id = this.id;
		modalRef.componentInstance.itemid = id;
		modalRef.componentInstance.items = _.cloneDeep(this.items);
		modalRef.componentInstance.hidefilter = onclick.hidefilter;

		let onclickButtons: ButtonType[] = _.cloneDeep(onclick.buttons);
		let listIndex = onclick.buttons.findIndex(button=>button == ButtonType.List);
		if (listIndex > -1) onclickButtons.splice(listIndex, 1);

		if (onclick.pagetype == PageType.ModalForm) {
            modalRef.componentInstance.onclick = { endpoint: onclick.endpoint, buttons: onclickButtons };
        } else if( onclick.pagetype == PageType.ModalTabForm ) {
            modalRef.componentInstance.endpoint = onclick.endpoint;
            modalRef.componentInstance.onclick = { endpoint: `${onclick.endpoint}/form`, buttons: onclickButtons };
        } else if (onclick.pagetype == PageType.ModalChart) {
            modalRef.componentInstance.chart_onclick = { endpoint: onclick.endpoint, buttons: onclickButtons };
        } else if (onclick.pagetype == PageType.ModalGrid) {
			//modalRef.componentInstance.pagetype = PageType.SubGrid;
			modalRef.componentInstance.id = id;
			modalRef.componentInstance.itemid = -1;
			modalRef.componentInstance.endpoint = onclick.endpoint;
			modalRef.componentInstance.buttons = onclickButtons;
			modalRef.componentInstance.onclick = onclick.onclick;
		}

		modalRef.result.then(result=>{
			if (result) {

				let compare_result = this.isArrayEqual(result.items, this.items);
				if (!compare_result) {
					this.onChangedGridData.next();
					// this.gridState = this.jqxTreeGrid.savestate();
					this.items = _.cloneDeep(result.items);
					this.setGridHeadersAndItems(this.headers, this.items);
				}
	
				let rowItems = this.jqxTreeGrid.getRows();
				this.selectItemById(result.itemid);
			}
		});
    }

	list() {
	}

	previous() {
		let items = this.jqxTreeGrid.getRows();
		let selItems = this.jqxTreeGrid.getSelection();
		let selItem;
		if (selItems.length > 0) selItem = selItems[0];

		let index =items.findIndex(item => item[ID_STR] == selItem[ID_STR]);
		index = --index % items.length;
		let prevId = items[index][ID_STR];
		this.selectItemById(prevId);
	}

	next() {
		let items = this.jqxTreeGrid.getRows();
		let selItems = this.jqxTreeGrid.getSelection();
		let selItem;
		if (selItems.length > 0) selItem = selItems[0];

		let index =items.findIndex(item => item[ID_STR] == selItem[ID_STR]);
		index = ++index % items.length;
		let prevId = items[index][ID_STR];
		this.selectItemById(prevId);
	}

	select() {
		let selItems = this.jqxTreeGrid.getSelection();
		let selItem;
		if (selItems.length > 0) selItem = selItems[0];
		
		this.onSelect.next(selItem);
	}

	setShowPosition(position: any) {
		if (position == 'bottom') {
			let items = this.jqxTreeGrid.getRows();
			this.selectItemById(items[items.length - 1][ID_STR]);
		}
		this.can_set_bottom = false;
	}

	selectItemById(id: any) {
		if (!id || !this.jqxTreeGrid) return;
		this.jqxTreeGrid.selectRow(id);
		this.jqxTreeGrid.ensureRowVisible(id);

		this.onChangeSelectedItem.next(id);
	}

	getDiabledModifyButtons() {
		return !this.jqxTreeGrid || 
			this.jqxTreeGrid.getSelection().length == 0 || 
			this.jqxTreeGrid.getRows().length == 0;
	}

	print() {
		if (this.jqxTreeGrid.getRows().length <= 0) {
			this.toastrService.danger("There is no rows to print on grid", "Error");
			return;
		}

		let headerTitle = this.title ? this.title : 'Eon Grid';
		let gridContent = this.jqxTreeGrid.exportData('html');
        let newWindow = window.open('', '', 'width=800, height=500'),
            document = newWindow.document.open(),
            pageContent =
                `<!DOCTYPE html>
                <html>
					<head>
						<meta charset="utf-8" />
						<title>${headerTitle}</title>
					</head>
					<body>
						${gridContent}
					</body>
				</html>`;
        document.write(pageContent);
        document.close();
        newWindow.print();
	}

	export(exportType: string, title: string) {
		if (this.jqxTreeGrid.getRows().length <= 0) {
			this.toastrService.danger("There is no rows to export on grid", "Error");
			return;
		}

		let headerTitle = title ? title : 'Eon Grid';
		this.jqxTreeGrid.exportData(exportType);
	}


	clickButtonBar(button: ButtonType) {
		switch (button) {
			case ButtonType.Add:
				this.add();
				break;
			case ButtonType.Delete:
				this.delete();
				break;
			case ButtonType.Save:
				this.save();
				break;
			case ButtonType.Edit:
			case ButtonType.View:
				this.view();
				break;
			case ButtonType.List:
				this.list();
				break;
			case ButtonType.Previous:
				this.previous();
				break;
			case ButtonType.Next:
				this.next();
				break;
			case ButtonType.Print:
				this.print();
				break;
			case ButtonType.Select:
				this.select();
				break;
			case ButtonType.Exit:
				this.onExit.next();
				break;

			case ButtonType.Export_Excel:
			case ButtonType.Export_XML:
			case ButtonType.Export_CSV:
			case ButtonType.Export_TSV:
			case ButtonType.Export_HTML:
			case ButtonType.Export_JSON:
			case ButtonType.Export_PDF:
				this.export(button.substring(7), this.title);
				break;
		}
	}


	isArrayEqual(x, y) {
		return _(x).differenceWith(y, _.isEqual).isEmpty();
	};

}
