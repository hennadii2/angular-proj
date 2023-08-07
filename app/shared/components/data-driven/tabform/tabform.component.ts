import { Component, OnInit, SimpleChanges, ViewChild, Input, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { ButtonType, TabPage, PageType, OnClick } from 'src/app/shared/models/data-driven.model';
import { FormBuilder } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { DataDrivenFormComponent } from '../form/form.component';
import { DataDrivenGridComponent } from '../grid/grid.component';
import { NgbTabset, NgbModal, NgbTabChangeEvent } from 'src/app/shared/ng-bootstrap';
import { Globals } from 'src/app/shared/constants/globals';

const TAB_ID_PREFIX = "tab_";
enum View {
	None = -1,
	Previous = 1,
	Next = 2,
	List = 3
}

@Component({
	selector: 'app-data-driven-tabform',
	templateUrl: './tabform.component.html',
	styleUrls: ['./tabform.component.scss']
})
export class DataDrivenTabFormComponent implements OnInit {
	TAB_ID_PREFIX = TAB_ID_PREFIX;
	ButtonType = ButtonType;
	TabPage = TabPage;
	PageType = PageType;

	@Input() parent_id: any =  -1;
	@Input() id: any = -1;
	@Input() endpoint: string;
	@Input() onclick: OnClick;
	@Input() tab_pages: TabPage[]=[]; 
	@Input() title_field: any;
	@Input() rowrefresh;

	@Input() buttons: ButtonType[]=[];
	@Input() default_disabled_buttons: ButtonType[]=[];
	@Input() form_class = '';
	
	@Input() activeTabId = null;
	@Input() isDashboardElement = false;
	
	newTabId = null;
	activeTab: TabPage = null;
	title: string;
	disabled_buttons: ButtonType[]=[ButtonType.Edit];

	@ViewChild(NgbTabset)
	private tabset: NgbTabset;

	@ViewChildren(DataDrivenGridComponent) tabList: QueryList<DataDrivenGridComponent>;
	@ViewChildren(DataDrivenFormComponent)	tabForms: QueryList<DataDrivenFormComponent>;
	
	clickedButton: ButtonType = null;

	@Output() onCreated = new EventEmitter();
	@Output() onUpdated = new EventEmitter();
	@Output() onDeleted = new EventEmitter();
	@Output() onTabChanged = new EventEmitter();
	@Output() onClickButtonBar = new EventEmitter();
	@Output() onExit = new EventEmitter();
	@Output() onSelect = new EventEmitter();
	@Output() onChangeView = new EventEmitter();
	
	constructor(
		private formBuilder: FormBuilder,
		private modalService: NgbModal,
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private globals: Globals
	) { 
	}

	ngOnInit() {
	}

	ngAfterViewInit() {

	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['activeTabId']) {
			if (this.activeTabId) this.selectTab(this.activeTabId);
		}

		if (changes['title_field'] || changes['id']) {
		
			if (this.id && this.id != -1 && this.title_field && this.title_field.length > 0) {
				if (this.tab_pages.length > 0) this.getTitle(this.tab_pages[0].endpoint, this.parent_id, this.id);
			} else if (this.id == -1) {
				this.getItemData(this.endpoint, -1);
			}
		}
	}

	ngDoCheck() {

		this.setDisableButtons();
		if (this.tab_pages && this.tab_pages.length > 0 && (this.id == -1 || !this.id))  {
			let firstTabId = TAB_ID_PREFIX + this.tab_pages[0].tab;
			this.selectTab(firstTabId)
			this.disableTabs(firstTabId);
		}
	}

	ngOnDestroy() {
	}

	getTitle(url: string, parent_id: string, id: string) {

		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id);

		this.dataDrivenService.getData(passed_url).subscribe(res=>{
			if (res['data'] && res['data'][0]) this.title = res['data'][0][this.title_field];
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}


	getItemData(url: string, id: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id);

		this.dataDrivenService.getFormData(passed_url, false).subscribe(res=>{
			if (id == -1) {
				if (res.data) {
					let data: any = {};
					if (this.globals.isArray(res.data)) data = res.data[0];
					else if (this.globals.isObject(res.dta)) data = res.data;

					this.id = data.id;
					this.afterCreate(data);

				} else if (res.id && res.id != -1){
					this.id = res.id;
				} 
				return;
			}
			let item = res.data[0];

			if (this.clickedButton == ButtonType.Save) {
				this.onUpdated.next(item);
			} else if (this.clickedButton == ButtonType.Add) {
				this.onCreated.next(item);
			} else if (this.clickedButton == ButtonType.Select) {
				this.onSelect.next(item);
			}

			this.clickedButton = null;
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}


	deleteData(url: string, id: any) {
		const modalRef = this.modalService.open(ModalConfirmComponent, {centered: true, draggableSelector: '.modal-header'});

        modalRef.result.then(result=>{
			if (result) {

				let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id);
				this.dataDrivenService.deleteData(passed_url).subscribe(res=>{
					if (res.error) {
						this.toastrService.danger(res.error.type, "Error");
					} else {
						this.toastrService.success("The item has been deleted successfully!", "Success");
						this.onDeleted.next(id);
					}
				}, err=>{
					this.toastrService.danger(err.message, "Error");
				});
			}
		});
	}

	setDisableButtons() {
		this.disabled_buttons = this.default_disabled_buttons ? [...this.default_disabled_buttons] : [];
		if (!this.tabForms || this.tabForms.length == 0) {
			this.disabled_buttons.push(ButtonType.Save);
		} else if (this.tabForms.length > 0) {
			let is_changed = false;
			this.tabForms.forEach(tabForm=>{
				if (!tabForm.form || (!_.isEqual(tabForm.form.value, tabForm.oldValue)))  {
					is_changed = true;
					return;
				}
			});
			if (!is_changed) this.disabled_buttons.push(ButtonType.Save);
		}
	}

	selectTab(activeTabId){
		this.newTabId = null;
		if (this.tab_pages.length > 0) {
			
			if (activeTabId) {
				this.activeTab = this.tab_pages.find(tab=> TAB_ID_PREFIX + tab.tab == activeTabId );
				this.activeTabId = activeTabId;
				setTimeout(()=>{
					this.tabset.select(this.activeTabId);
				}, 0);
			}
			else {
				this.activeTabId = TAB_ID_PREFIX + this.tab_pages[0].tab;
				this.activeTab = this.tab_pages[0];
			}
		}

	}

	disableTabs(noDisableId) {
		if (!this.tabset.tabs) return;
		this.tabset.tabs.forEach(tab=>{
			if (tab.id != noDisableId) {
				tab.disabled = true;
			}
		});
	}

	enableTabs() {
		if (!this.tabset.tabs) return;
		this.tabset.tabs.forEach(tab=>{
			tab.disabled = false;
		});
	}

	beforeTabChange(event: NgbTabChangeEvent) {
		if (this.buttons.indexOf(ButtonType.Save) > - 1 && 
				this.disabled_buttons.indexOf(ButtonType.Save) == -1) {

			event.preventDefault();
			const modalRef = this.modalService.open(ModalConfirmComponent);
			modalRef.componentInstance.message = "MODAL.CHANGES_NOT_SAVED";
			modalRef.componentInstance.btn_yes = "SAVE";
			modalRef.componentInstance.btn_no = "CANCEL";

			modalRef.result.then(result=>{
				if (result) {
					this.newTabId = event.nextId;
					this.save();
				} else {
					this.selectTab(event.nextId);
				}
			});
		} else {
			this.activeTabId = event.nextId;
			this.newTabId = null;
			this.activeTab = this.tab_pages.find(tab=> TAB_ID_PREFIX + tab.tab == event.nextId );
			this.onTabChanged.next(this.activeTabId);
		}
	}

	save() {
		if (!this.tabForms && this.tabForms.length == 0) return;

		this.tabForms.forEach(tabForm=>{
			tabForm.save();
		});
	}

	clickButtonBar(button: ButtonType) {
		 if (button == ButtonType.Save) {
		 	this.save();
		 } else if  (button == ButtonType.Delete) {
			this.deleteData(this.endpoint, this.id);
			//this.onClickButtonBar.next(button);
		 }else if (button == ButtonType.OK) {
			this.clickedButton = button;
			this.onChangeView.next({page: this.onclick.pagetype, itemid: this.id});
		} else if (button == ButtonType.Cancel) {
			this.onClickButtonBar.next(ButtonType.Exit);
			this.onExit.next();
		} else if (button == ButtonType.Select) {
			this.clickedButton = ButtonType.Select;
			this.getItemData(this.endpoint, this.id);
		} else if (this.buttons.indexOf(ButtonType.Save) > - 1 && 
				this.disabled_buttons.indexOf(ButtonType.Save) == -1) {
			const modalRef = this.modalService.open(ModalConfirmComponent);
			modalRef.componentInstance.message = "MODAL.CHANGES_NOT_SAVED";
			modalRef.componentInstance.btn_yes = "SAVE";
			modalRef.componentInstance.btn_no = "CANCEL";

			modalRef.result.then(result=>{
				if (result) {
					this.clickedButton = button;
					this.save();
				} else {
					this.ButtonEvent(button);
				}
			});
		} else {
			this.ButtonEvent(button);
		}
	}

	afterCreate(item: any) {
		this.id = item.id;
		this.enableTabs();
		// this.clickedButton = ButtonType.Add;
		this.onCreated.next(item);

		let index = this.disabled_buttons.indexOf(ButtonType.Save);
		this.disabled_buttons.splice(index, 1);
		if (this.newTabId) this.selectTab(this.newTabId);
	}
	
	afterUpdate(item: any) {
		this.onUpdated.next(item);
		let index = this.disabled_buttons.indexOf(ButtonType.Save);
		this.disabled_buttons.splice(index, 1);

		if (this.newTabId) this.selectTab(this.newTabId);
		// this.clickedButton = ButtonType.Save;
	}


	ButtonEvent(button: ButtonType) {
		switch (button) {
			case ButtonType.Delete:
				break;
			case ButtonType.Save:
				break;
			case ButtonType.Add:
				//this.id = -1;
				// let firstTabId = TAB_ID_PREFIX + this.tabPages[0].tab;
				// this.selectTab(firstTabId)
				// this.disableTabs(firstTabId);
				this.onChangeView.next({page: PageType.TabForm, itemid: -1});
				break;
			case ButtonType.Edit:
			case ButtonType.View:
			case ButtonType.List:
			case ButtonType.Previous:
			case ButtonType.Next:
			case ButtonType.Select:
				this.onClickButtonBar.next(button);
				break;
			case ButtonType.Exit:
				this.onClickButtonBar.next(button);
				this.onExit.next();
				break;
			case ButtonType.Select:
				break;				
		}

		this.clickedButton = null;
	}

}
