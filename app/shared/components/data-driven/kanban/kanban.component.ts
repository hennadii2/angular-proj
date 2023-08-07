import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation, ViewChild, SystemJsNgModuleLoaderConfig, EventEmitter, Output, Renderer } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { OnClick, ButtonType, PageSize, FormItemLabel, FormItemType, KanbanResourceType, KanbanColumnType, KanbanSourceType } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { jqxKanbanComponent } from 'jqwidgets-ng/jqxkanban';
import { Key } from 'selenium-webdriver';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { DataDrivenModalEditKanbanComponent } from '../modal/edit-kanban/edit-kanban.component';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { NgbModal } from 'src/app/shared/ng-bootstrap';

@Component({
	selector: 'app-data-driven-kanban',
	templateUrl: './kanban.component.html',
	styleUrls: ['./kanban.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DataDrivenKanbanComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;
	PageSize = PageSize;

	objectKeys = Object.keys;

	@Input() endpoint: string;
	@Input() itemid: string;
	@Input() onclick: OnClick;
	@Input() buttons: ButtonType[]=[];
	@Input() form_class = '';
	@Input() default_disabled_buttons: ButtonType[]=[];
	@Input() isDashboardElement: boolean;
	@Input() title: string;
	@Input() selectedId;
	disabled_buttons: ButtonType[]=[ButtonType.Edit];

	@Output() onExit = new EventEmitter();
	
	isUpdating: boolean = false
	columns: any[];
	items: any[];
	labels: FormItemLabel[] = [];
	blocks: any[]=[];
	maxSortNumber = 0;
	fields: any[];
	source: any[];
	resources: any[] = [{ id: 0, name: 'No name', common: true }];
	dataAdapter: any;

	template: string =
    `<div class="jqx-kanban-item" id="">
		<div class="jqx-kanban-item-color-status"></div>
		<div style="display: none;" class="jqx-kanban-item-avatar"></div>
		<div class="jqx-kanban-item-text"></div>
		<div class="jqx-kanban-item-footer pt-0"></div>
    </div>`;

	@ViewChild('jqxKanban') jqxKanban: jqxKanbanComponent;
	kanbanSettings: jqwidgets.KanbanOptions;

	button_corner: number;
	componentDestroyed = new Subject(); // Component Destroy

	constructor(
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private deviceService: DeviceDetectorService,
		private modalService: NgbModal,
		private tokenStorage: TokenStorage,
		private renderer: Renderer
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['endpoint'] || changes['itemid']) {
			if (this.endpoint && this.itemid) {
				this.getColumnData(this.endpoint, this.itemid);
			}
		}

		if (changes['onclick'] || changes['itemid']) {
			if (this.onclick.endpoint && this.itemid)  {
				this.getKanbanData(this.onclick.endpoint, this.itemid, true);
			}
		}
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}
	
	refreshKanban () {
		this.showMainSpinner(true)
		this.isUpdating = true
	
		const kanbanApiUrl = this.onclick.endpoint
		const kanbanKey = this.itemid
		const isLabel = true
		
		this.dataDrivenService
			.getKanbanData(kanbanApiUrl, kanbanKey, isLabel)
			.subscribe(res => {
				if (res.error) {
					this.toastrService.danger(res.error.type, "Error")
				}
		
				let newItems = _.orderBy(res.data, [KanbanSourceType.SortOrder])
			
				_.forEach(this.items, (item) => {
					const currentItem = this.convertItem(item, this.fields)
					this.jqxKanban.removeItem(currentItem.id)
				})
			
				this.items = _.orderBy(res.data, [KanbanSourceType.SortOrder])
			
				_.forEach(this.items, (item) => {
					const newItem = this.convertItem(item, this.fields)
					this.jqxKanban.addItem(newItem)
				})
		
				this.getMaxSortOrderNumber()
			}, err => {
				this.toastrService.danger(err.message, "Error")
			})
			
		this.isUpdating = false
		this.showMainSpinner(false)
	}
	
	showMainSpinner(isShow: boolean) {
			let spinnerEl = document.getElementsByClassName("lds-css")[0];

			if (spinnerEl.classList.contains("d-none")) {
				 if (isShow) spinnerEl.classList.remove("d-none")
			} else  {
				 if (!isShow) spinnerEl.classList.add("d-none");
			}
	}
	
	getColumnData(url: string, key: any) {
		this.dataDrivenService.getKanbanData(url, key, false).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}

			this.columns = this.generateColumns(res.data);
			if (this.source && !this.kanbanSettings) this.generateKanbanSettings();
			
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}

	getKanbanData(url: string, key: any, is_label: boolean) {
		this.dataDrivenService.getKanbanData(url, key, is_label).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}
			
			this.items = res.data;
			this.items = _.orderBy(this.items, [KanbanSourceType.SortOrder]);

			this.getMaxSortOrderNumber();

			if (res.blocks) this.blocks = res.blocks;

			if (is_label) {
				this.labels = res.labels;
				this.fields = this.generateMappingFields(this.labels);
				this.source = this.generateSource(this.items, this.fields);
				if (this.columns && !this.kanbanSettings) this.generateKanbanSettings();
			}

		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}

	updateItem(url: string, data: any) {
		if (!this.isUpdating) {
			this.dataDrivenService.updateData(url, data).subscribe(res=>{
				if (res.error) {
					this.toastrService.danger(res.error.type, "Error");
				} else {
					this.toastrService.success("The data has been updated successfully!", "Success");
				}

				let uItem = this.convertItem(res.data[0], this.fields);
				let index = this.items.findIndex(item=> item.id == uItem.id);
				
				if (uItem['status'] == this.items[index]['status']) {
					this.jqxKanban.updateItem(uItem.id, uItem);
				} else {
					this.jqxKanban.removeItem(uItem.id);
					this.jqxKanban.addItem(uItem);
				}

				if (index > -1) this.items[index] = res.data[0];

				let sort_orders = this.generateSortOrdersArray(this.columns);

				this.updateSortOrders(url, sort_orders);
				// this.source = this.generateSource(this.items, this.fields);
				// this.jqxKanban.source(this.source);

			}, err=>{
				this.toastrService.danger(err.message, "Error");
			});
		}
	}

	updateSortOrders(url: string, sortorders: any) {
		this.dataDrivenService.updateData(url, sortorders).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			} else {
				//this.toastrService.success("The data has been updated successfully!", "Success");
			}
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}


	createItem(url: string, data: any) {
		if (!this.isUpdating) {
			data[KanbanSourceType.SortOrder] = ++this.maxSortNumber
			
			data.name ='EON'
			
			this.dataDrivenService.createData(url, data).subscribe(res=>{
				if (res.error) {
					this.toastrService.danger(res.error, "Error");
				} else {
					this.toastrService.success("The data has been created successfully!", "Success");
				}
				
				this.items.push(res.data[0]);
				
				let newItem = this.convertItem(res.data[0], this.fields);
				
				this.jqxKanban.addItem(newItem);
			}, err=>{
				this.toastrService.danger(err.message, "Error");
			});
		}
	}

	deleteItem(url: string, id: string) {
		if (!this.isUpdating) {
			const modalRef = this.modalService.open(ModalConfirmComponent, {centered: true, draggableSelector: '.modal-header'});

	        modalRef.result.then(result=>{
				if (result) {
					this.dataDrivenService.deleteData(`${url}/${id}`).subscribe(res=>{
						if (res.error) {
							this.toastrService.danger(res.error.type, "Error");
						} else {
							this.toastrService.success("The item has been deleted successfully!", "Success");
						}

						this.jqxKanban.removeItem(id);
					}, err=>{
						this.toastrService.danger(err.message, "Error");
					});
				}
			});
		}
	}

	generateColumns(columns: any[]) {
		let cols = [];
		columns.forEach(column=>{

			let col = {
				text: column.text, 
				iconClassName: this.getIconClassName(), 
				dataField: column['status'],
				collapsible: column['collaps']
			}
			if (column['maxitems'] != null) col['maxItems'] = column['maxitems'];

			cols.push(col);
		});


		return cols;
	}

	generateMappingFields(labels: FormItemLabel[]) {
		let fields: any[]=[];
		labels.forEach(label=>{
			let field: any = {name: label.fieldname, type: 'string'};
			if (label.widgettype){
				field['name'] = label.widgettype;
				field['map'] = label.fieldname;
			} 
			
			fields.push(field);
		});
		
		return fields;
	}

	generateSource(items: any[], fields: any[]) {
		// let source = {
		// 	localData: items,
		// 	dataType: 'array',
		// 	dataFields: this.fields
		// }

		// this.dataAdapter = new jqx.dataAdapter(source);
		let sce: any[] = [];
		items.forEach(item=>{
			let source_item: any = this.convertItem(item, fields);
			sce.push(source_item);
		});

		this.dataAdapter = new jqx.dataAdapter(sce); 
		return sce;
	}

	convertItem(item: any, fields: any[]) {
		let target_item: any = {};
		fields.forEach(field=>{
			if (field.map) target_item[field.name] = item[field.map];
			else target_item[field.name] = item[field.name];
		});

		//target_item['color'] = this.getRandomColor();
		target_item[KanbanSourceType.Id] = `${target_item['id']}`;

		return target_item;
	}

	generateResources(items: any[]) {
		let resources: any[]=[];
		items.forEach(item=>{
			let resource = {id: item['id']};
		})
	}

	generateKanbanSettings() {
		this.kanbanSettings =
		{
			columns: this.columns,
			source: this.source,
			resources: this.resourcesAdapterFunc(),
			template: this.template,
			itemRenderer: this.itemRenderer,
			columnRenderer: this.columnRenderer
		};
		//if (this.jqxKanban) this.jqxKanban.destroy();
		this.jqxKanban.createComponent(this.kanbanSettings);
	}

	getRandomColor() {
		var color = Math.floor(0x1000000 * Math.random()).toString(16);
		return '#' + ('000000' + color).slice(-6);
	}


	getWidth() : any {
		if (document.body.offsetWidth > 850) {
			return '100%';
		}
		
		return 850;
	}
	
    getIconClassName = (): string => {
        return 'jqx-icon-plus-alt';
    }

	columnRenderer = (element: any, collapsedElement: any, column: any): void => {  
        if (element[0] && this.jqxKanban) {
            let elementHeaderStatus = element[0].getElementsByClassName('jqx-kanban-column-header-status')[0];
            let collapsedElementHeaderStatus = collapsedElement[0].getElementsByClassName('jqx-kanban-column-header-status')[0];
			let columnItems = this.jqxKanban.getColumnItems(column.dataField).length;
			let html = '';
			
			if (column.maxItems != 0 && column.maxItems != 9999) html = ` (${columnItems}/${column.maxItems})`;
			else html = ` (${columnItems})`;

            elementHeaderStatus.innerHTML = html;
            collapsedElementHeaderStatus.innerHTML = html;
        }
	};
	
	itemRenderer = (element: any, item: any, resource: any): void => {
		let itemId = item.id;
		if (this.selectedId == item.id) {
			element[0].classList.add("border");
		}

		element[0].getElementsByClassName('jqx-kanban-item-color-status')[0].innerHTML = 
		`<span style="line-height: 23px; margin-left: 5px;">${item.text}</span>
		<div>
			<div class="jqx-icon ion-close-round jqx-kanban-item-close jqx-kanban-last-icon"></div>
			<div class="jqx-icon ion-edit jqx-kanban-item-edit jqx-kanban-second-icon"></div>
		</div>`;
		element[0].getElementsByClassName('jqx-kanban-item-text')[0].innerHTML = 
		`<span style="line-height: 23px; margin-left: 5px;">${item.content}</span>`;

		let index = this.items.findIndex(it=> it.id == item.id);
		if (this.items[index]['list_func']) return;

		this.items[index]['list_func'] = this.renderer.listen(element[0], 'click', (event: any): void => {
			this.selectedId = item.id;

			let classes = event.target.getAttribute("class");
			if (!classes) return;
			if (classes.indexOf('jqx-kanban-item-edit') > -1 ) {
				let item_data = this.items.find(it=>it.id == item.id);
				this.editItem(false, null, item_data);
			} else if (classes.indexOf('jqx-kanban-item-close') > -1 ) {
				this.deleteItem(this.onclick.endpoint, itemId);
			}

		});
		if (this.items[index]['list_double_func']) return;

		this.items[index]['list_double_func'] = this.renderer.listen(element[0], 'dblclick', (event: any): void => {
			this.selectedId = item.id;
			let classes = event.target.getAttribute("class");
			if (classes && classes.indexOf('jqx-kanban-item-close') > -1 ) {
				this.deleteItem(this.onclick.endpoint, itemId);
			} else {
				let item_data = this.items.find(it=>it.id == item.id);
				this.editItem(false, null, item_data);
			}

		});
	};

	editButtonClick() {
	}
	
	onColumnAttrClicked(event: any): void {
        let args = event.args;
        if (args.attribute == 'button') {
            args.cancelToggle = true;
            if (!args.column.collapsed) {
				this.editItem(true, args.column.dataField, null);
            }
        }
    };
	
	onItemAttrClicked(event: any): void {
		let args = event.args;
        if (args.attribute == 'clsoe') {
			this.deleteItem(this.onclick.endpoint, args.itemId);
		} else if (args.attribute == 'edit') {
			let item_data = this.items.find(it=>it.id == args.itemId);
			this.editItem(false, null, item_data);
		} else {
			this.selectedId = args.itemId;
		}

		return;
	};

	onItemMoved(event: any): void {
		const args = event.args
		const itemData = args.itemData
		const newColumnId = args.newColumn.dataField
		const endPoint = this.onclick.endpoint
		if (itemData[KanbanSourceType.Status] !== newColumnId) {
			let item = this.items.find(it => it.id === args.itemId)
			let statusField = this.fields.find(field => field.name === KanbanSourceType.Status)
		
			item[statusField['map']] = 	args.newColumn ? args.newColumn.dataField : null
		}
		
		const itemsOrderPayload = this.generateSortOrdersArray(this.columns)
		
		this.updateSortOrders(endPoint, itemsOrderPayload)
	}

	generateSortOrdersArray(columns: any) {
		let kanbanElement;
		
		if (this.isDashboardElement) {
			kanbanElement = document.getElementsByClassName('jqx-kanban')[0]
		} else {
			kanbanElement = document.getElementsByClassName('jqx-kanban')[1]
		}
		
		let kanbanElementID = kanbanElement.id
		let order_items:any = []
		let order_number = 0
		
		columns.forEach(column => {
			let column_container:any = this.findColumn(column[KanbanColumnType.DataField])
			
			column_container.childNodes.forEach(child => {
				let itemElementId = child.id
				let item = this.items.find(it => kanbanElementID + "_" + it.id == itemElementId)
				if (item) order_items.push({
					id: item.id, 
					sortorder: order_number++, 
					status: item.status
				})
			})
		})
		
		this.maxSortNumber = order_number
		
		return order_items
	}

	getMaxSortOrderNumber() {
		this.items.forEach( item =>{
			if (item[KanbanSourceType.SortOrder] > this.maxSortNumber) this.maxSortNumber = item[KanbanSourceType.SortOrder]
		});
	}

	findColumn(dataField) {
		let kanbanElement;
		
		if (this.isDashboardElement) {
			kanbanElement = document.getElementsByClassName('jqx-kanban')[0]
		} else {
			kanbanElement = document.getElementsByClassName('jqx-kanban')[1]
		}
		
		var All = kanbanElement.getElementsByClassName('jqx-kanban-column-container');
		for (var i = 0; i < All.length; i++)       {
		  if (All[i].getAttribute('data-kanban-column-container') == dataField) { return All[i]; }
		}
	}

	resourcesAdapterFunc = (): any => {
        let resourcesSource =
            {
                localData: this.items,
                dataType: 'array',
                dataFields: [
                    { name: 'id', type: 'number' },
                    { name: 'name', type: 'string' },
                    { name: 'image', type: 'string' },
                    { name: 'common', type: 'boolean' }
                ]
            };
        let resourcesDataAdapter = new jqx.dataAdapter(resourcesSource);
        return resourcesDataAdapter;
	}


	editItem(is_add: boolean, status: any, data: any = null) {
		if (!this.isUpdating) {
			let columns = _.cloneDeep(this.columns);

			columns.map((column, index) =>{
				column[KanbanColumnType.CurrentItems] = this.jqxKanban.getColumnItems(column[KanbanColumnType.DataField]).length;		
				return column;
			});

			let can_add_index = columns.findIndex(c => c[KanbanColumnType.MaxItems] == 0 || c[KanbanColumnType.CurrentItems] < c[KanbanColumnType.MaxItems]);
			let add_column = columns.find(c => c[KanbanColumnType.DataField] == status);
			let can_add = (!add_column && can_add_index != -1) || 
							(add_column && 
								(add_column[KanbanColumnType.MaxItems] == 0 || 
								add_column[KanbanColumnType.MaxItems] > add_column[KanbanColumnType.CurrentItems]));

			if (is_add && !can_add) {
				this.toastrService.danger("You can't add item anymore", "Error");
				return;
			}
			
			const modalRef = this.modalService.open(DataDrivenModalEditKanbanComponent, {centered: true, draggableSelector: '.modal-header'});
			modalRef.componentInstance.is_add = is_add;
			modalRef.componentInstance.columns = columns;

			modalRef.componentInstance.labels = _.cloneDeep(this.labels);
			modalRef.componentInstance.blocks = this.blocks;
			
			let state = status ? status : (columns[can_add_index] ? columns[can_add_index][KanbanColumnType.DataField] : null);

			if (is_add) modalRef.componentInstance.data = { status: state, parent_id: this.itemid };
			else modalRef.componentInstance.data = data;

			modalRef.result.then(result=>{
				if (result) {
					let data: any = _.cloneDeep(result);
					data['parent_id'] = this.itemid;
					if (!data.id) this.createItem(this.onclick.endpoint, data);
					else this.updateItem(this.onclick.endpoint, data);
				}
			});
		}
	}
	
	clickButtonBar (buttonType: ButtonType) {
		switch (buttonType) {
			case ButtonType.Add:
				this.editItem(true, null, {})
				break

			case ButtonType.Exit:
				this.onExit.next()
				break
			
			case ButtonType.Refresh:
				this.refreshKanban()
				break
		}
	}
}
