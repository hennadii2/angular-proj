import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { PageType, ButtonType, OnClick, PageSize, ChangeViewInfo, TabPage, TypeView, GridShowPosition } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { DataDrivenGridComponent } from '../grid/grid.component';
import { DataDrivenFormComponent } from '../form/form.component';
import { DataDrivenChartComponent } from '../chart/chart.component';
import { DataDrivenTabFormComponent } from '../tabform/tabform.component';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { DataDrivenTreeGridComponent } from '../treegrid/treegrid.component';


enum GridRowAction {
	Create = 0,
	Update = 1,
	Changed = 2
}

@Component({
	selector: 'app-data-driven-formset',
	templateUrl: './formset.component.html',
	styleUrls: ['./formset.component.scss']
})
export class DataDrivenFormSetComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;
	PageType = PageType;
	PageSize = PageSize;

	@Input() maintype: PageType = PageType.Grid
	@Input() pagetype: PageType = PageType.Grid
	@Input() title: string
	@Input() id: any = -1
	@Input() itemid: any = -1
	@Input() endpoint: string
	@Input() rowrefresh: string
	@Input() buttons: ButtonType[] = []
	@Input() form_class = ''
	@Input() filterStr = ""
	@Input() hidefilter: boolean
	@Input() groupable: boolean
	@Input() hidefilterrow: boolean
	@Input() fieldheight: number
	@Input() onclick: OnClick = null
	@Input() chart_onclick: OnClick = null
	@Input() form_data: any
	@Input() items: any[] = []
	@Input() tab_pages: TabPage[]=[]
	@Input() position: GridShowPosition
	@Input() draggable: boolean = false
	@Input() typeview: TypeView[] = []
	@Input() isSearchModal: boolean = false
	@Input() isDashboardElement: boolean = false
	@Input() isModal: boolean = false
	
	@Output() onExit = new EventEmitter();
	@Output() onSelect = new EventEmitter();
	@Output() onChangeView = new EventEmitter();

	activeTabId: string;
	disabled_buttons: ButtonType[]=[];
	title_field: string;

	gridRowAction: GridRowAction = null;

	@ViewChild('mainGrid') mainGrid: DataDrivenGridComponent;
	@ViewChild('mainTreeGrid') mainTreeGrid: DataDrivenTreeGridComponent;
	@ViewChild('subForm')	subForm: DataDrivenFormComponent;
	@ViewChild('subGrid')	subGrid: DataDrivenGridComponent;
	@ViewChild('subChart') subChart: DataDrivenChartComponent;
	@ViewChild('subTab')     subTab: DataDrivenTabFormComponent;

	constructor(
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private modalService: NgbModal
	) {
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['onclick'] || changes['pagetype']) {
			if (this.onclick && 
				(this.pagetype == PageType.TabForm || this.onclick.pagetype == PageType.TabForm ) && 
				this.onclick.endpoint) {
					this.getTabPages(this.onclick.endpoint);
			}
		}
	}

	ngDoCheck() {
		this.setDisableButtons();
	}

	ngOnDestroy() {
	}

	setDisableButtons() {
		this.disabled_buttons = [];
		if (!this.items || this.items.length == 0) {
			this.disabled_buttons.push(ButtonType.Previous);
			this.disabled_buttons.push(ButtonType.Next);

			return;
		} 
		
		if (!!this.itemid) {
			return;
		}
		
		let index = this.items.findIndex(item => item.id == this.itemid);

		if (index == 0) {
			this.disabled_buttons.push(ButtonType.Previous);
		}
		if (index >= this.items.length - 1) {
			this.disabled_buttons.push(ButtonType.Next);
		}
	}

	
	getTabPages(url: string) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, this.id);
		let index = passed_url.indexOf('?');
		if (index > -1) {
			passed_url = `${passed_url}&tab=0`;
		} else {
			passed_url = `${passed_url}?tab=0`;
		}
		this.dataDrivenService.getData(passed_url).subscribe(res=>{
			this.tab_pages = res['tabpages'];
			this.title_field = res['titlefield'];
			if (!this.tab_pages) return;
			this.tab_pages.forEach(tabPage=>{
				if (tabPage.pagetype == PageType.Form) tabPage.form_changed = false;
			});

		}, err=>{
			this.toastrService.danger(err.message, 'Error');
		});
	}

	getGridRowItem(url: string, itemid: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, itemid);

		this.dataDrivenService.getData(passed_url).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}
			if (res['data'] && res['data'][0]) {
				let item = res['data'][0];
				if (this.gridRowAction == GridRowAction.Create) {
					this.afterCreate(item);
				} else if (this.gridRowAction == GridRowAction.Update) {
					this.afterUpdate(item);
				}
			}

		}, err=>{
			this.toastrService.danger(err.message, 'Error');
		})
	}

	changeView(params: ChangeViewInfo) {
		this.itemid = params.itemid;

		this.form_data = params.data;
		if ( params.page == PageType.Chart) {
			this.chart_onclick = params.onclick;
		}

		if ( (this.pagetype == PageType.Grid || 
			this.pagetype == PageType.TabGrid ||
			this.pagetype == PageType.TreeGrid) 
			&& params.items) {
			this.items = params.items;
		}
		this.pagetype = params.page;
		this.onChangeView.next(this.pagetype);

	}

	selectItem(item: any) {
		if (!item) return;
		this.onSelect.next({items: this.items, item: item, itemid: item.id});
	}

	tabChange(tabId) {
		if (this.activeTabId != tabId) this.activeTabId = tabId;
	}			

	list() {
		if (this.maintype == PageType.Grid || this.maintype == PageType.TabGrid) {
			this.pagetype = PageType.Grid;
			this.mainGrid.selectItemById(this.itemid);
		} else if (this.maintype == PageType.TreeGrid) {
			this.pagetype = PageType.TreeGrid;
			this.mainTreeGrid.selectItemById(this.itemid);
		}
	}

	onItemChange(itemId) {
		this.itemid = itemId;
	}

	save() {
		if (this.mainGrid && this.pagetype==PageType.Grid) this.mainGrid.save();
		else if (this.mainTreeGrid && this.pagetype == PageType.TreeGrid) this.mainTreeGrid.save();
		else if (this.subForm  && this.pagetype==PageType.Form) this.subForm.save();
		else if (this.subTab && this.pagetype==PageType.TabForm) this.subTab.save();
	}

	add() {
		if (this.mainGrid && this.pagetype==PageType.Grid) this.mainGrid.add();
		else if (this.mainTreeGrid && this.pagetype == PageType.TreeGrid) this.mainTreeGrid.add();
		else if (this.subForm  && this.pagetype==PageType.Form) this.subForm.clickButtonBar(ButtonType.Add);
		else if (this.subTab && this.pagetype==PageType.TabForm) this.subTab.clickButtonBar(ButtonType.Add);
	}

	delete() {
		if (this.mainGrid && this.pagetype==PageType.Grid ) this.mainGrid.delete();
		else if (this.mainTreeGrid && this.pagetype == PageType.TreeGrid) this.mainTreeGrid.delete();
		else if (this.subForm  && this.pagetype==PageType.Form) this.subForm.clickButtonBar(ButtonType.Delete);
		else if (this.subTab && this.pagetype==PageType.TabForm) this.subTab.clickButtonBar(ButtonType.Delete);
	}

	view() {
		this.changeView({page: this.pagetype, itemid: this.itemid});
	}
	
	previous() {
		if (!this.items || this.items.length == 0) return;
		let index = this.items.findIndex(i=>i.id == this.itemid);

		index = --index % this.items.length;
		this.itemid = this.items[index].id;

		if (this.mainGrid) {
			this.mainGrid.selectItemByIndex(index);
		} else if (this.mainTreeGrid) {
			this.mainTreeGrid.selectItemById(this.itemid);
		}
	}

	next() {
		if (!this.items || this.items.length == 0) return;
		let index = this.items.findIndex(i=>i.id == this.itemid);

		index = ++index % this.items.length;
		this.itemid = this.items[index].id;

		if (this.mainGrid) {
			this.mainGrid.selectItemByIndex(index);
		} else if (this.mainTreeGrid) {
			this.mainTreeGrid.selectItemById(this.itemid);
		}
	}

	newitem() {
		if (!this.onclick) return;
		this.itemid = -1;
		if (this.subForm) this.subForm.id = -1;
	}

	select() {
		//this.onSelect.next();
	}

	exit() {
		this.onExit.next({items: this.items, item: null, itemid: this.itemid});
	}

	afterCreate(item: any) {

		if (!this.items || !item) return;
		// console.log("created", this.itemid, item);
		// if (this.rowrefresh && this.gridRowAction == null) {
		// 	this.gridRowAction = GridRowAction.Create;
		// 	this.getGridRowItem(this.rowrefresh, item.id);
		// 	return;
		// }
		this.gridRowAction = null;
		
		this.items.push(item);
		this.itemid = item.id;


		if (this.mainGrid) {
			this.mainGrid.items = this.items;
			this.mainGrid.addRowToGrid(item);
		} else if (this.mainTreeGrid) {
			this.mainTreeGrid.items = this.items;
			this.mainTreeGrid.addRowToGrid(item);
		}
	}
	
	afterUpdate(item: any) {
		if (!this.items || this.items.length == 0) return;
		// console.log("updated", this.itemid, item);
		// if (this.rowrefresh && this.gridRowAction == null) {
		// 	this.gridRowAction = GridRowAction.Update;
		// 	this.getGridRowItem(this.rowrefresh, item.id);
		// 	return;
		// }
		this.gridRowAction = null;

		let index = this.items.findIndex(i=>i.id == item.id);
		this.items[index] = item;

		if (this.mainGrid) {
			this.mainGrid.items = this.items;
			this.mainGrid.updateRowOfGrid(item.id, item);
		} else if (this.mainTreeGrid) {
			this.mainTreeGrid.items = this.items;
			this.mainTreeGrid.updateRowOfGrid(item.id, item);
		}


	}

	afterDelete(itemId: any) {
		if (!this.items || this.items.length == 0) return;
		// console.log("deleted", this.itemid, itemId);
		let index = this.items.findIndex(i=>i.id == itemId);

		this.items.splice(index, 1);

		if (this.items.length > 0) {
			index = index >= this.items.length - 1 ? this.items.length - 1 : index;
			this.itemid = this.items[index];
		} else {
			this.itemid = null;
			this.changeView({page: this.maintype, itemid: this.itemid});
		}

		if (this.mainGrid) {
			this.mainGrid.items = this.items;
			this.mainGrid.deleteRowFromGrid(itemId);
		} else if (this.mainTreeGrid) {
			this.mainTreeGrid.items = this.items;
			this.mainTreeGrid.deleteRowFromGrid(itemId);
		}


	}

	convertDataToGridItem(headers: any[], item: any) {
		let convertItem = {};
		convertItem['id'] = item.id;
		headers.forEach(header=>{
			convertItem[header.data] = item[header.data];
		});

		return convertItem;
	}

	clickButtonBar(button: ButtonType) {
		switch (button) {
			case ButtonType.Add:
				this.newitem();
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
			case ButtonType.Select:
				this.select();
				break;
			case ButtonType.Exit:
				this.exit();
				break;
		}		
	}
}
