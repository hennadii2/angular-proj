import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { PageType, ButtonType, OnClick, PageSize, GridSelectionMode, GridShowPosition } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { JqxGridDataType, JqxGridColumnType } from 'src/app/shared/models/jqx.models';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { DataDrivenModalFormSetComponent } from '../modal/formset/formset.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { Button } from 'selenium-webdriver';

const ID_STR = 'id';
const SEARCH_STR = '?key=';
const BOOL_STR = 'bool';
const DATE_FORMAT = 'dd/MM/yy';
const GRID_MIN_WIDTH = 850;
const GRID_BLOCK_SIZE = 500;

@Component({
	selector: 'app-data-driven-grid',
	templateUrl: './grid.component.html',
	styleUrls: ['./grid.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DataDrivenGridComponent implements OnInit {
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
	@Input() onok: OnClick = null;
	@Input() filterStr: string = "";
	@Input() items: any[]=[];
	@Input() pagetype: PageType;
	@Input() title: string;
	@Input() height: number;
	@Input() position: GridShowPosition;
	@Input() row_draggable: boolean = false;
	@Input() groupable: boolean = false;
	@Input() hidefilterrow: boolean = false;
	@Input() isSearchModal: boolean = false
	@Input() isDashboardElement: boolean = false
	@Input() isModal: boolean = false
	@Input() data: any;
	
	@Output() onExit = new EventEmitter();
	@Output() onSelect = new EventEmitter();

	@Output() onChangeView = new EventEmitter();
	@Output() onChangeSelectedItem = new EventEmitter();
	@Output() onChangedGridData = new EventEmitter();
	@Output() onBeforeClickButtonBar = new EventEmitter();
	@Output() onDropRowToTarget = new EventEmitter();


	headers: any[]=[];
	filteredItems: any[]=[];
	
	source: any = null;
	gridAdapter: any = null;
	columns: any[]= null;

	oldFilterStr: string = "";
	can_set_bottom: boolean = false;
	
	searchPerformed: boolean = false
	
	button_corner: number;
	gridState: any;
	gridSelectionMode: GridSelectionMode = GridSelectionMode.SingleRow;

	@ViewChild('searchInput') searchEl: ElementRef;
	@ViewChild('jqxGrid') jqxGrid: jqxGridComponent;

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
		if (!this.isDashboardElement) {
			this.focusSearchInput()
		}
	}
	
	ngOnChanges (changes: SimpleChanges) {
		if (changes[ID_STR] || 
				changes['endpoint'] || 
				changes['onclick']) 
			{
				if (this.endpoint && 
					 (this.pagetype == PageType.Grid || 
						this.pagetype == PageType.TabGrid)) 
					{
						if (!!this.filterStr || this.hidefilter ) {
							this.searchPerformed = true
							
							this.getDataWithFilter(this.endpoint, 
																		 this.id, 
																		 this.filterStr, 
																		 this.columns ? false: true, 
																		 this.position)
					 	} else {
					 		this.getStructure(this.endpoint, this.id);
					  }
					}
		}
	}
	
	ngDoCheck() {

		if (this.can_set_bottom && this.jqxGrid) {
			this.setShowPosition(this.position);
		}

		this.setDisableButtons();
	}

	ngOnDestroy() {
		this.isDestroyed = true;
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}
	
	replaceQueryParam(param, newval, search) {
    let regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?")
    let query = search.replace(regex, "$1").replace(/&$/, '')

    return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '')
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
			this.gridSelectionMode = this.getGridSelectionMode();

			this.columns = this.generateColumns(this.headers);

			this.items = [];

			this.source = null;

			this.setGridHeadersAndItems(this.headers, this.items);

			this.focusSearchInput();

		}, err=>{
			this.toastrService.danger(err.message, "Error");
			this.focusSearchInput();
		});
	}

	getDataWithFilter(url: string, 
										id: string, 
										filterStr: string, 
										isHeader: boolean, 
										position: GridShowPosition, 
										startId: any = null) {
		let passedUrl = this.dataDrivenService.replaceFieldsOfUrl(url, id, this.data)
		
		passedUrl = `${passedUrl}${url.indexOf('?')  > -1 ? '&' : '?'}position=${position=="bottom" ? position : "top"}`
		
		if (!!filterStr) {
			passedUrl = this.replaceQueryParam('key', filterStr, passedUrl)
		}
	
		if (startId) {
			passedUrl = `${passedUrl}&start=${startId}`
		} else {
			this.items = []
		}
		
		this.dataDrivenService.getGridData(passedUrl, isHeader).subscribe(res => {
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}

			if (this.filterStr != filterStr || this.isDestroyed) {
				console.log(this.isDestroyed)
				return
			}

			let resultArr: any[] = res.data
			let newStartId: any = null

			if (!!!this.items) this.items = []

	 		if (position == GridShowPosition.Bottom) {
				this.items = resultArr.concat(this.items)
			} else {
				this.items = this.items.concat(resultArr)
			}
			
			if (this.items.length === 1 && this.isSearchModal) {
				const activeItem = this.items[0]
				this.onSelect.next(activeItem)
			} else {
				if (res.headers && res.headers.length > 0) {
					this.headers = res.headers
					this.columns = this.generateColumns(this.headers)
					this.gridSelectionMode = this.getGridSelectionMode()
				} 
				this.setGridHeadersAndItems(this.headers, this.items)
				if (res.serverload && resultArr.length > 0) {
					if (position == GridShowPosition.Bottom) {
						if (resultArr.length > 0) {
							newStartId = resultArr[0]['id']
						}
					} else {
						newStartId = resultArr[resultArr.length - 1]['id']
					} 
					this.getDataWithFilter(url, id, filterStr, false, this.position, newStartId)
				} else {
					this.focusSearchInput();
				}
				
				if (startId) {
					this.can_set_bottom = true
				}
			}
		}, err => {
			this.toastrService.danger(err.message, "Error")
			this.focusSearchInput()
		})
	}

	updateItem(url: string, data: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, data.id, data);

		this.dataDrivenService.updateData(passed_url, data).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			} else {
				this.toastrService.success("The data has been updated successfully!", "Success");
			}

			let index = this.items.findIndex(item => item.id == data.id);
			this.items[index] = data;

			this.updateRowOfGrid(data.id, data);

		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}

	deleteItem(url: string, itemid: any) {
		
		const modalRef = this.modalService.open(ModalConfirmComponent, {centered: true, draggableSelector: '.modal-header'});

        modalRef.result.then(result=>{
			if (result) {
				let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, itemid);
				// let param_index = passed_url.indexOf('?');
				// if (param_index > -1) passed_url = url.substring(0, param_index);

				this.dataDrivenService.deleteData(passed_url).subscribe(res=>{
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
		if (!this.jqxGrid) return;
		let items = this.jqxGrid.getrows();
		let index = items.findIndex(item=> item.id == id);
		let rid = this.jqxGrid.getrowid(index);
		this.jqxGrid.deleterow(rid);
		index = (index + 1) > this.jqxGrid.getrows().length ? this.jqxGrid.getrows().length - 1 : index;
		setTimeout(()=>{this.selectItemByIndex(index);}, 50);
		this.onChangedGridData.next();
	}

	addRowToGrid(item: any) {
		if (!this.jqxGrid) return;
		this.jqxGrid.beginupdate();
		this.jqxGrid.addrow(null, item);
		this.jqxGrid.endupdate();

		this.selectItemById(item.id);
		this.onChangedGridData.next();
	}

	addRowsToGrid(items: any[]) {
		if (!this.jqxGrid) return;
		this.jqxGrid.beginupdate();

		items.forEach(item => {
			this.jqxGrid.addrow(null, item);
		});

		this.jqxGrid.endupdate();
		this.onChangedGridData.next();
	}

	clearRows() {
		if (!this.jqxGrid) return;
		this.jqxGrid.clear();
	}

	updateRowOfGrid(id: any, item: any) {
		if (!this.jqxGrid) return;
		let items = this.jqxGrid.getrows();
		let index = items.findIndex(item=> item.id == id);
		let rid = this.jqxGrid.getrowid(index);

		this.jqxGrid.updaterow(rid, item);
		this.onChangedGridData.next();
		//this.jqxGrid.ensurerowvisible(index);

		// this.selectItemByIndex(index);
	}

	setGridHeadersAndItems(headers: any[], items : any[]) {
		if (!this.source) {
			this.source = this.generateGridSource(headers, items);
			this.gridAdapter = new jqx.dataAdapter(this.source);
		} else {
			this.source.localdata = items;
			this.jqxGrid.updatebounddata('cells');
		}
	}

	focusSearchInput() {
		if (!this.isDashboardElement) {
			if (this.deviceService.isDesktop()) {
				// alert("Focus");
				if (this.searchEl) this.searchEl.nativeElement.focus();
			} else {
				// alert("Blur");
				if (this.searchEl) this.searchEl.nativeElement.blur();
			}
		}
	}

	setDisableButtons() {
		this.disabled_buttons = [ButtonType.Save, ButtonType.List];
		if (this.getDiabledModifyButtons()) {
			this.disabled_buttons.push(ButtonType.Edit);
			this.disabled_buttons.push(ButtonType.Delete);
			this.disabled_buttons.push(ButtonType.View);
		}
		
		if (!this.jqxGrid || this.getSelectedRowIndex() == -1) {
			this.disabled_buttons.push(ButtonType.Previous);
			this.disabled_buttons.push(ButtonType.Next);
			this.disabled_buttons.push(ButtonType.Select);
		} else {
			if (this.getSelectedRowIndex() == 0) {
				this.disabled_buttons.push(ButtonType.Previous);
			} 
			if (this.getSelectedRowIndex() >= this.jqxGrid.getrows().length - 1) {
				this.disabled_buttons.push(ButtonType.Next);
			}
		}
	}

	gridReady = (): void => {
		this.can_set_bottom = true;
	   //this.setShowPosition(this.position);
	    if (this.gridState) {
			setTimeout(()=>{this.jqxGrid.loadstate(this.gridState);}, 0);
			this.gridState = null;
		}
		
	}

	setEditable(headers: any[]) {
		if (!this.jqxGrid) return;

		headers.forEach(header=>{
			this.jqxGrid.setcolumnproperty(header.data, 'editable', header.edit);
		});
	}
	
	gridRendered = (type: any): void => {

		if (type != "rows") return;
		if (!this.row_draggable) return;

		// Initialize the DragDrop plug-in. Set it's drop target to the second Grid.
		let options = {
			revert: true,
			dragZIndex: 99999,
			appendTo: 'body',
			dropAction: 'none',
			dropTarget: '.btn-drop-target',
			initFeedback: (feedback: any): void => {
				feedback.height(33);
				feedback.width(300);
			}
		};

		let uglyGridDragDropCells = jqwidgets.createInstance('.jqx-grid-cell', 'jqxDragDrop', options);
		let flattenGridDragDropCells = flatten(uglyGridDragDropCells);
        function flatten(arr: any[]): any[] {
            return arr.reduce((flat: any[], toFlatten: any[]): any[] => {
                return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
            }, []);
		}
		let target = null;
		// Add Event Handlers
		for (let i = 0; i < flattenGridDragDropCells.length; i++) {
			// Disable revert when the dragged cell is over the second Grid.
			flattenGridDragDropCells[i].addEventHandler('dropTargetEnter', (event: any): void => {
				flattenGridDragDropCells[i].revert = false;
				target = event.args.target;
			});
			// Enable revert when the dragged cell is outside the second Grid.
			flattenGridDragDropCells[i].addEventHandler('dropTargetLeave', (event: any): void => {
				flattenGridDragDropCells[i].revert = true;
				target = null;
			});
			// initialize the dragged object.
			flattenGridDragDropCells[i].addEventHandler('dragStart', (event: any): void => {
				target = null;
				let value = event.target.innerHTML;
				let row = event.target.parentElement;

				let position = jqx.position(event.args);
				flattenGridDragDropCells[i].data = { value: value };

				let feedback = flattenGridDragDropCells[i].feedback;
				let feedbackHTML = `<div>`;

				row.cells.forEach((cell, index)=>{
					feedbackHTML += cell.outerHTML;
				});

				feedbackHTML += `</div>`;

				feedback.html(feedbackHTML);
			});
			// Set the new cell value when the dragged cell is dropped over the second Grid.      
			flattenGridDragDropCells[i].addEventHandler('dragEnd', (event: any): void => {
				let index: number = this.getSelectedRowIndex();
				let item = this.jqxGrid.getrowdata(index);

				if (!flattenGridDragDropCells[i].revert){
					this.onDropRowToTarget.next({item: item, target: target.context});
				}
			});
		}
	}

	flatten(arr: any[]): any[] {
		return arr.reduce((flat: any[], toFlatten: any[]): any[] => {
			return flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten);
		}, []);
	}

	Bindingcomplete(event) {
		//this.setShowPosition(this.position);
	}

	gridScrollfeedback = (row: any): string => {
        return;
    };


	generateGridSource(headers: any[], data: any[]) {
		let source = {localdata: [], datafields: [], datatype: JqxGridDataType.Json};
		if (!headers || this.headers.length == 0) return source;

		let datafields = [];

		let id_datafield = {
			name: ID_STR,
		};
		
		datafields.push(id_datafield);

		headers.forEach((header, index)=>{
			let datafield = {
				name: header.data,
				type: header.type,
			}
			if (header.type == JqxGridColumnType.Date) datafield['format']=DATE_FORMAT;
			if (header.type == JqxGridColumnType.CheckBox) datafield['type']=BOOL_STR;
			datafields.push(datafield);
		});

		source = {
			localdata: data ? data : [],
			datafields: datafields,
			datatype: JqxGridDataType.Array
		}
		
		return source;
	}

	generateColumns(headers: any[]) {
		let columns = [];
		if (!headers || headers.length == 0) return columns;


		headers.forEach((header, index)=>{
			let column = {
				text: header.title,
				datafield: header.data,
				width:  header.width,
				editable: header.edit
			}

			switch (header.type) {
				case JqxGridColumnType.String: 
					column['cellsalign'] = "left";
					column['filtertype'] = "input";
					column['columntype'] =  'text';
					break;
				case JqxGridColumnType.Number:
				case JqxGridColumnType.Int:
					column['cellsalign'] = "right";
					column['filtertype'] = "number";
					column['cellsformat'] = 'n';

					if (header.edit) column['columntype'] =  'numberinput';
					break;
				case JqxGridColumnType.Float:
					column['cellsalign'] = "right";
					column['filtertype'] = "number";
					// column['columntype'] =  'number';
					column['cellsformat'] = 'f2';

					if (header.edit) column['columntype'] =  'numberinput';
					break;
				case JqxGridColumnType.Date:
					column['cellsalign'] = "right";
					column['filtertype'] = "range";
					// column['columntype'] =  'datetime';	
					column['cellsformat'] = DATE_FORMAT;
					break;
				case JqxGridColumnType.CheckBox:
					column['cellsalign'] = "center";
					column['filtertype'] = "bool";
					column['columntype'] = 'checkbox';
			}

			if (index==0) {
				column['aggregates']=[{
                    '#':
                    (aggregatedValue: number, currentValue: string): number => {
                        return aggregatedValue + 1;
                    }
                }];
			} else if (header.total) {
				column['aggregates']=[header.total];
				column['cellsrenderer']= (row: number, column: any, value: any, rowData: any): string => {
					if(value.toString().indexOf('Sum') >= 0 ){
						return `<div style="position: relative; margin: 4px; text-align: right;">${value.replace(/Sum|:/g,'')}</div>`;
					}
				}
				column['aggregatesrenderer'] = (aggregates: any, column: any, element: any): string => {
					let renderstring = '';//'<div class="jqx-widget-content jqx-widget-content-energy-blue" style="float: left; width: 100%; height: 100%; ">';

					for (let obj in aggregates) {
						let value = aggregates[obj];
						 //parseFloat(value.replace(/,/g, '')).toFixed(2)
						renderstring += `<div style="position: relative; margin: 4px; text-align: right;">${value}</div>`;
					}
					//renderstring +='</div>';
					return renderstring;
				}
			}
			columns.push(column);
		});

		
		let id_column = {
			text: ID_STR,
			datafield: ID_STR,
			hidden: true
		};
		
		columns.push(id_column);
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
			return screen.height / 100.0 * 50;
		} 
		return 130 + 32 * this.height;
	}

	getGridSelectionMode(): GridSelectionMode {
		let result:GridSelectionMode = GridSelectionMode.SingleRow;


		if (this.headers && this.headers.length > 0 && this.headers.filter(header=>header.edit).length > 0){
		 	result = GridSelectionMode.MultipleCellsAdvanced;
		}

		return result;
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
		if (event.keyCode == 13) {
			if (!this.searchPerformed) {
				this.search()
				event.target.blur()
			}
		}
	}
	onCellDoubleClick(event) {
		if (event.args.column.editable) {
			
		} else {
			this.view();
		}

		this.onBeforeClickButtonBar.next(ButtonType.Edit);
	}

	onRowDoubleClick(event) {
	}

	onCellBeginEditEvent(event) {
	}

	onCellEndEditEvent(event) {
		
		let row = event.args.row;
		let field = event.args.datafield;
		let oldValue = event.args.oldvalue;
		let newValue = event.args.value;

		if (oldValue != newValue) {

			let index = this.items.findIndex(item => item.id == row.id);
			let data = _.cloneDeep(this.items[index]);
			data[field] = newValue;

			if (this.onclick && this.onclick.endpoint && this.onclick.endpoint != "") {
				this.updateItem(this.onclick.endpoint, data);
			} else {
				this.items[index][field] = newValue;
			}
		}
	}


	save() {
	}

	add() {
		if (!this.onclick) return;
		this.switchView(this.onclick, -1);
	}

	getSelectedRowIndex() {
		let index = -1;
		if (this.jqxGrid) {

			switch (this.gridSelectionMode) {
				case GridSelectionMode.SingleRow:
				case GridSelectionMode.MultipleRows:
				case GridSelectionMode.MultipleRowsExtended:
					index = this.jqxGrid.getselectedrowindex();
					break;
				case GridSelectionMode.SingleCell:
				case GridSelectionMode.MultipleCellsExtended:
				case GridSelectionMode.MultipleCellsAdvanced:
					let cell = this.jqxGrid.getselectedcell();
					if (cell) index = cell.rowindex;
					break;
				case GridSelectionMode.CheckBox:
					index = this.jqxGrid.getselectedrowindex();
					break;
			}

		}

		return index;
	}

	view() {
		if (this.buttons.indexOf(ButtonType.Select) > -1 && this.disabled_buttons.indexOf(ButtonType.Select)== -1) {
			this.select();
			return;
		}

		if (!this.onclick) return;
		let index: number = this.getSelectedRowIndex();
		let item = this.jqxGrid.getrowdata(index);

		this.switchView(this.onclick, item.id);
	}

	edit() {
		if (!this.onclick) return;
		let index: number = this.getSelectedRowIndex();
		let item = this.jqxGrid.getrowdata(index);

		this.switchView(this.onclick, item.id);
	}


	delete() {
		if (!this.onclick) return;
		let index: number = this.getSelectedRowIndex();
		let item = this.jqxGrid.getrowdata(index);

		this.deleteItem(this.onclick.endpoint, item.id);
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
					this.gridState = this.jqxGrid.savestate();
					this.items = _.cloneDeep(result.items);
					this.setGridHeadersAndItems(this.headers, this.items);
				}
	
				let rowItems = this.jqxGrid.getrows();
				let itemIndex = rowItems.findIndex(item=>item.id == result.itemid);
				this.selectItemByIndex(itemIndex);
			}
		});
    }

	list() {
	}

	previous() {
		let index: number = this.getSelectedRowIndex();
		index = --index % this.jqxGrid.getrows().length;

		this.selectItemByIndex(index);
	}

	next() {
		let index: number = this.getSelectedRowIndex();
		index = ++index % this.jqxGrid.getrows().length;

		this.selectItemByIndex(index);
	}

	select() {
		let index: number = this.getSelectedRowIndex();
		let item = this.jqxGrid.getrowdata(index);
		let selectedItem = this.items.find(it=> it.id == item.id);
		
		this.onSelect.next(selectedItem);
	}

	setShowPosition(position: any) {
		this.can_set_bottom = false;	
		if (position == 'bottom') {
			this.selectItemByIndex(this.jqxGrid.getrows().length - 1);
		}
	}

	selectItemById(id: any) {
		if (!this.jqxGrid || !id) return;

		let items = this.jqxGrid.getrows();
		let index = items.findIndex(item=> item.id == id);
		this.selectItemByIndex(index);
	}

	selectItemByIndex(index: number) {
		if (index < 0 || !this.jqxGrid) return;
		// this.jqxGrid.selectrow(index);
		this.jqxGrid.ensurerowvisible(index);

		let item = this.jqxGrid.getrows()[index];
		// this.onChangeSelectedItem.next(item.id);
	}

	getDiabledModifyButtons() {
		return !this.jqxGrid || 
			this.getSelectedRowIndex() == -1 || 
			this.jqxGrid.getrows().length == 0;
	}

	print() {
		if (this.jqxGrid.getrows().length <= 0) {
			this.toastrService.danger("There is no rows to print on grid", "Error");
			return;
		}

		let headerTitle = this.title ? this.title : 'Eon Grid';
		let gridContent = this.jqxGrid.exportdata('html');
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
		if (this.jqxGrid.getrows().length <= 0) {
			this.toastrService.danger("There is no rows to export on grid", "Error");
			return;
		}

		let headerTitle = title ? title : 'Eon Grid';
		this.jqxGrid.exportdata(exportType, headerTitle);
	}


	clickButtonBar(button: ButtonType) {
		this.onBeforeClickButtonBar.next(button);
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
				this.edit();
				break;
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
			case ButtonType.Refresh:
				this.search();
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

	onKey(e) {
		if (e.keyCode ==13 && !this.deviceService.isDesktop()) {
			if (e.target == this.searchEl.nativeElement) return;
			let activeElement = <HTMLElement>document.activeElement;
			activeElement && activeElement.blur && activeElement.blur();
		}
	}

}