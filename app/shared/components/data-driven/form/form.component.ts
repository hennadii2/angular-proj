import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output, ViewChildren, ViewEncapsulation, ViewChild, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { FormItemLabel, FormItemType, ButtonType, PageSize, PageType, OnClick, ColorType, FormItemPipe } from 'src/app/shared/models/data-driven.model';
import { debounceTime, distinctUntilChanged, takeUntil, switchMap } from 'rxjs/operators';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { DataDrivenModalFormSetComponent } from '../modal/formset/formset.component';
import { DataDrivenModalWebPageComponent } from '../modal/modal-web-page/modal-web-page.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { CustomValidators } from 'src/app/shared/validators/custom-validators';
import { ModalCalculatorComponent } from 'src/app/shared/modals/calculator/calculator.component';
import { DataDrivenGridComponent } from '../grid/grid.component';
import { HttpEventType } from '@angular/common/http';
import { FileService } from 'src/app/shared/services/file.service';
import { viewClassName } from '@angular/compiler';
import { ModalAlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { TabService } from 'src/app/tab/tab.service';
import { Tab } from 'src/app/tab/tab';

@Component({
	selector: 'app-data-driven-form',
	templateUrl: './form.component.html',
	styleUrls: ['./form.component.scss'],
	encapsulation: ViewEncapsulation.None
	//providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class DataDrivenFormComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	
	ColorType = ColorType;
	FormItemType = FormItemType;
	ButtonType = ButtonType;
	PageSize = PageSize;
	PageType = PageType;

	objectKeys = Object.keys;

	@Input() parent_id =  -1;
	@Input() id: any = -1;
	@Input() endpoint: string;
	@Input() onclick: OnClick;
	@Input() buttons: ButtonType[]=[];
	@Input() rowrefresh: string;
	@Input() form_class = '';
	@Input() default_disabled_buttons: ButtonType[]=[];
	@Input() isModal: boolean;
	@Input() title: string;

	disabled_buttons: ButtonType[]=[ButtonType.Edit];

	@Output() onCreated = new EventEmitter();
	@Output() onUpdated = new EventEmitter();
	@Output() onDeleted = new EventEmitter();

	@Output() onClickButtonBar = new EventEmitter();
	@Output() onExit = new EventEmitter();
	@Output() onSelect = new EventEmitter();

	@Output() onChangeView = new EventEmitter();
	@Input() data: any;
	@Input() labels: FormItemLabel[] = [];
	@Input() blocks: any[]=[];
	@Input() isDashboardElement: boolean = false;
	
	form: FormGroup;
	oldValue: any;
	
	clickedButton: ButtonType = null;
	button_corner: number;
	onok_apis_count: number = 0;

	focusElement: any;

	@ViewChildren('input') vc;
	@ViewChildren(DataDrivenGridComponent) childGrids: QueryList<DataDrivenGridComponent>;
	setFocus: boolean = false;
	autoSave: boolean = false;
	
	currentLattitude:number = 0;
	currentLongitude: number = 0;
	
	selectedDropdownItem: any
	
	componentDestroyed = new Subject(); // Component Destroy
	constructor(
		private tabService: TabService,	
		private formBuilder: FormBuilder,
		private modalService: NgbModal,
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private fileService: FileService,
		private deviceService: DeviceDetectorService,
		private tokenStorage: TokenStorage
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
		this.getGPSLocation();
	}

	ngOnInit() {
		if (this.isDashboardElement && this.rowrefresh) {
			const interval = parseInt(this.rowrefresh) * 1000
			this.automaticRefresh(interval)
		}
	}
	
	automaticRefresh (interval) {
		if (this.isDashboardElement && this.rowrefresh && this.tokenStorage.getDashboardData()) {
			setTimeout(() => {
				this.refreshForm()
				
				this.automaticRefresh(interval)
			}, interval)
		}
	}
	
	refreshForm () {
		const apiUrl = this.endpoint
		const componentId = this.id
		const isLabel = this.labels && this.labels.length > 0 ? false : true
		const endpointUrl = this.dataDrivenService.replaceFieldsOfUrl(apiUrl, componentId)
		
		if (!this.isModal) {
			this.dataDrivenService.getFormData(endpointUrl, isLabel).subscribe(res => {
				if (res.error) {
					this.toastrService.danger(res.error.type, `Error`)
				}
			
				this.data = res.data && res.data[0] ? res.data[0] : ( res.data ? res.data : null)

				if (!this.data) {
					this.data = {}
				}

				this.buildForm(this.labels, this.data)
			}, err => {
				this.toastrService.danger(err.message, `Error`)
			})
		}
	}
	
	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['default_disabled_buttons']) {
			//console.log(this.default_disabled_buttons);
			// return;
		}

		if (changes['id'] || changes['endpoint']) {
			if (this.endpoint) this.getData(this.endpoint, this.id, this.labels && this.labels.length > 0 ? false : true);
		}
		
		if (changes['onclick']) {

		}

		if (changes['labels']) {
			if (this.labels && this.data) {
				this.buildForm(this.labels, this.data);
			}
		}

		

	}

	ngDoCheck() {

		this.disabled_buttons = this.default_disabled_buttons ? [...this.default_disabled_buttons] : [];

		if (!this.form || _.isEqual(this.convertNull(this.form.value), this.oldValue)) { // 
			this.disabled_buttons.push(ButtonType.Save);	
		} 
		if (!this.id || this.id == -1) {
			this.disabled_buttons.push(ButtonType.Select);
		}

		if (!this.setFocus && !this.deviceService.isDesktop()) {
			this.setFocus = true;
		}

		if (!this.vc || !this.vc.first || this.setFocus || this.isDashboardElement ) return;

		setTimeout(() => {
			this.setFocusFirstInputElement()
		})
	}

	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}

	setFocusFirstInputElement() {
		if (!!this.focusElement) {
			this.focusElement.select();
			this.focusElement.focus();
		} else {
			this.vc.first.nativeElement.select();
			this.vc.first.nativeElement.focus();
		}
		this.setFocus = true;	
		// this.focusElement = null;
	}

	getGPSLocation() {
		if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(position =>{
			this.currentLattitude = position.coords.latitude;
			this.currentLongitude = position.coords.longitude;
		  });
		} else {
			this.currentLattitude = 0;
			this.currentLongitude = 0;
		}
	}

	getItemData(url: string, itemid: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, itemid);

		this.dataDrivenService.getData(passed_url).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}
			if (res['data'] && res['data'][0]) {
				let item = res['data'][0];
				if (this.form) this.setDataToForm(this.form, item);
			}

		}, err=>{
			this.toastrService.danger(err.message, 'Error');
		})
	}

	getSearchItem(url: string, itemid: any, label: FormItemLabel, data: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, itemid, data);

		this.dataDrivenService.getData(passed_url).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}

			if (res['data'] && res['data'][0]) {
				let item = res['data'][0];

				this.setGridItemToInputs(item, label);
			}

		}, err=>{
			this.toastrService.danger(err.message, 'Error');
		})
	}


	getData(url: string, id: string, is_label: boolean) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id);

		this.dataDrivenService.getFormData(passed_url, is_label).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}
			if (res.labels) this.labels = res.labels;
			if (res.blocks) this.blocks = res.blocks;

			// Set autosave value for preventing confirmation popup in form actions
			if (!!res.autosave) {
				this.autoSave = res.autosave;
			}			
			
			this.data = res.data && res.data[0] ? res.data[0] : ( res.data ? res.data : null);
			
			console.log(this.data);
			// if (this.data && this.data.id && this.data.id != -1) {
			// 	if (Number(id) == -1 || !id) this.onCreated.next(this.data);
			// 	this.id = this.data.id;
			// } 
			if (!this.data) this.data = {};
			//this.oldValue = this.form.value;

			this.buildForm(this.labels, this.data);
			// this.refreshForm()
			this.setFocus = false;
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}

	updateData(url: string, id: string, data: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, id, data);
		//if (this.parent_id!=null && this.parent_id!= -1) data['parent_id'] = this.parent_id;
		//if (!data.id) data.id = id;
		this.dataDrivenService.updateData(passed_url, data).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			} else {
				this.toastrService.success("The data has been updated successfully!", "Success");
			}

			this.onUpdated.next(res.data && res.data[0] ? res.data[0] : res.data);
			this.oldValue = data;

			this.onok_apis_count = 0;

			setTimeout(()=>{this.ButtonEvent(this.clickedButton);}, 300);
			this.setFocus = false;
		}, err=>{
			this.onok_apis_count = 0;
			this.onUpdated.next(null);
			//this.ButtonEvent(this.clickedButton);
			this.toastrService.danger(err.message, "Error");
		});
	}

	updateGridData(url: string, id: string, items: any) {
		let passed_url =  this.dataDrivenService.replaceFieldsOfUrl(url, id);
		this.dataDrivenService.updateData(passed_url, items).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error, "Error");
			} else {
				this.toastrService.success("The data has been updated successfully!", "Success");
			}

			this.onok_apis_count--;
			if (this.onok_apis_count == 0) {
				this.onSelect.next(this.form.value);
			}

		}, err=>{
			this.onok_apis_count--;
			if (this.onok_apis_count == 0) this.onSelect.next(this.form.value);

			this.toastrService.danger(err.message, "Error");
		});
	}

	createData(url: string, data: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, '');

		//if (this.parent_id!=null && this.parent_id!= -1) data['parent_id'] = this.parent_id;
		this.dataDrivenService.createData(passed_url, data).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error, "Error");
			} else {
				this.toastrService.success("The data has been created successfully!", "Success");
			}
			
			if (res.data) {
				this.id = res.data[0].id;
				this.form.controls['id'].setValue(this.id);
			}
			this.onCreated.next(res.data[0]);
			this.oldValue = this.form.value;
			this.setFocus = false;

			setTimeout(()=>{this.ButtonEvent(this.clickedButton);}, 300);

		}, err=>{

			this.onCreated.next(null);
			this.toastrService.danger(err.message, "Error");
		});
	}

	deleteData(url: string, id: string) {
		const modalRef = this.modalService.open(ModalConfirmComponent, {centered: true, draggableSelector: '.modal-header'});

        modalRef.result.then(result=>{
			if (result) {
				let passed_url =  this.dataDrivenService.replaceFieldsOfUrl(url, id);

				this.dataDrivenService.deleteData(passed_url).subscribe(res=>{
					if (res.error) {
						this.toastrService.danger(res.error.type, "Error");
					} else {
						this.toastrService.success("The item has been deleted successfully!", "Success");
						// this.formReset();
						this.onDeleted.next(id);
					}
				}, err=>{
					this.toastrService.danger(err.message, "Error");
				});
			}
		});
	}

	uploadFile(label: FormItemLabel, data: any) {
		let formData = new FormData();
		formData.append('file', data, data.name);
		let checkFileType =  data.name.split('.').pop();
		console.log(checkFileType);

		label.showProgress = true;
		this.fileService.uploadFile(formData).subscribe(event=>{

			if (event.type === HttpEventType.UploadProgress) {
				label.progress = Math.round(event.loaded / event.total * 100);
			} else if (event.type === HttpEventType.Response) {
				label.showProgress = false;
				let file = event.body.filename
				if (!this.data) this.data = {};
				this.data[label.fieldname]= file;
				this.form.controls[label.fieldname].setValue(file);

				this.save();	
			}


		}, err=>{
			label.showProgress = true;

			this.form.controls[label.fieldname].setValue(this.oldValue[label.fieldname]);
			this.save();
			this.toastrService.danger(err.message, "Error");
		});
	}

	getFileData(url: string, label: FormItemLabel, search_key: string, fields?: string) {
		this.dataDrivenService.getFileData(url, search_key, true, fields).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
			}
			if (!res.data) label.items = [];
			else label.items = res.data.filter(item=>!this.isValueEmpty(item));
			//if (this.form) this.form.controls[label.fieldname].setValue(search_key);
		}, err=>{
			label.items = [];
			this.toastrService.danger(err.message, "Error");
		});
	}

	getValidationData(url: string, label: FormItemLabel) {

		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(url, this.id, this.form.value);

		this.dataDrivenService.getData(passed_url).subscribe(res=>{
			if (label) label.server_error = res;

			if (!label && res && res.message && res.message.trim() !="" ) {
				this.openAlertModal(res.valid ? "Info" : "Error", res.message);
			}

			if (res.valid && !!res.data) {
				Object.keys(res.data).forEach(key=>{
					this.form.controls[key].setValue(res.data[key]);
				});
			} 
		}, err=>{
			this.toastrService.danger(err.message, "Error");
		});
	}


	buildForm(form_labels:FormItemLabel[], data: any) {

		let controls = {};
		if (!form_labels || form_labels.length == 0) return;

		if (this.parent_id!= null && this.parent_id != -1) {
			controls['parent_id']=[this.parent_id, [Validators.required]];
		}


		form_labels.forEach(label=>{
			let value: any;
			if (label.inputtype == FormItemType.Button || label.inputtype == FormItemType.Grid) return; 
			if (data) {
				// if (label.data) {
				// 	value = data[label.data.file] ? data[label.data.file][label.data.fieldname] : '';
				// } else {
				// 	value = data[label.fieldname];
				// }

				value = data[label.fieldname];
				value = typeof(value) == 'string' ? value.trim() : value;
			}

			if (label.inputtype == FormItemType.Float || label.inputtype == FormItemType.ReadFloat) {
				value = Number(parseFloat(value ? value : 0).toFixed(2));
			} else if (label.inputtype == FormItemType.Int || label.inputtype == FormItemType.ReadInt) {
				value = parseInt(value ? value : 0);
			} else if (label.inputtype == FormItemType.DropDown) {
				//this.getFileData(label.grid, label, value);
				label.items=[];

				if (data && data[label.data.file]) {
					label.items.push(data[label.data.file]);
				} 
			}else if (label.inputtype == FormItemType.Signature
				|| label.inputtype == FormItemType.Draw) {
				label.refresh = true;
			} else if (label.inputtype == FormItemType.Lattitude) {
				value = this.currentLattitude;
			} else if (label.inputtype == FormItemType.Longitude) {
				value = this.currentLongitude;
			}

			let validators = [];
			if (label.inputtype == FormItemType.Email) {
				validators.push(Validators.email);
				if (label.length > 0) validators.push(Validators.maxLength(label.length));
			} else if (label.inputtype == FormItemType.Phone ) {
				if (label.length > 0) validators.push(Validators.maxLength(label.length));
			} else if (label.inputtype == FormItemType.Text ) {
				if (label.length > 0) validators.push(Validators.maxLength(label.length));				
			} else if (label.inputtype == FormItemType.Int || label.inputtype == FormItemType.ReadInt ) {
				validators.push(Validators.max(this.getMaxValueFromLength(label.length)));
				validators.push(Validators.min(0));				
			} else if (label.inputtype == FormItemType.Float || label.inputtype == FormItemType.ReadFloat ) {
			
			}else if ( this.isDateField(label.inputtype) ) {
				validators.push(CustomValidators.date);
			} else if (label.inputtype == FormItemType.Lattitude) {
				validators.push(Validators.min(-90));
				validators.push(Validators.max(90));
			}else if (label.inputtype == FormItemType.Longitude) {
				validators.push(Validators.min(-180));
				validators.push(Validators.max(180));
			}

			if (label.notempty) {
				validators.push(Validators.required);
			}

			controls[label.fieldname] = [value, validators];
		});

		this.form = this.formBuilder.group(controls);
		 //let firstControl = this.form.controls[form_labels[0].fieldname];
		// firstControl['nativeElement'].focus();
		this.oldValue = this.form.value;

		
		form_labels.forEach(label=>{
			if (label.inputtype == FormItemType.DropDown || label.inputtype == FormItemType.Search) {
				label.search = new EventEmitter();
				label.search.pipe(
					debounceTime(500),
					distinctUntilChanged(),
					takeUntil(this.componentDestroyed),
					// switchMap((filter: string) =>{
					// 	return this.dataDrivenService.getFileData(label.grid, filter).pipe(
					// 		switchMap((res)=>res.data as Array<any>)
					// 	)
					// })
				).subscribe((filter:string) => {
					this.getFileData(label.grid, label, filter);
				});
			}

			if (label.validation) {
				if (!this.form.controls[label.fieldname]) return;
				this.form.controls[label.fieldname].valueChanges.pipe(
					debounceTime(500),
					distinctUntilChanged(),
					takeUntil(this.componentDestroyed),
				).subscribe((filter:string) => {
					this.getValidationData(label.validation, label);
				});
			}
		});


	}

	converFormData(form_labels:FormItemLabel[], form: FormGroup) {
		let value: any = this.form.value;
		Object.keys(value).forEach(key=>{
			let label = form_labels.find(label=>label.fieldname == key);
			if (label.data) {
				if (!value[label.data.file]) value[label.data.file] = {};
				value[label.data.file][label.data.fieldname] = value[key];
				delete value[key];
			}
		})

		return value;
	}

	setDataToForm(form: FormGroup, data: any) {
		Object.keys(data).forEach(key=>{
			if (form.controls[key]) this.form.controls[key].setValue(data[key]);
		});

		if (this.id && this.id != -1) {
			this.onUpdated.next(this.form.value);
			this.oldValue = this.form.value;
		}
	}
	 
	changeDrawData(label: FormItemLabel, data: any) {
		label.refresh = false;
		this.form.controls[label.fieldname].setValue(data);
	}

	changeImage(label: FormItemLabel,  data: any) {
		this.form.controls[label.fieldname].setValue(data);
	}

	changeTime(label: FormItemLabel, time: any) {
		this.form.controls[label.fieldname].setValue(this.convertTime12to24(time));
	}

	selectDate(label:FormItemLabel, event: any) {
		let date = event._inputValue;
		this.form.controls[label.fieldname].setValue(date);
	}

	openDatePicker(label:FormItemLabel, event: any) {
		event._inputValue = this.form.controls[label.fieldname].value;
	}

	onSearchGrid(search_key: string, label: FormItemLabel) {
		if (label.isOpenedFormSet || 
				!label.data) return

		let modal_param = { 
			centered: true, 
			draggableSelector: '.modal-header'
		}
												
		if (label.data.pagesize && 
				label.data.pagesize != PageSize.Medium) 
			 modal_param['size'] = label.data.pagesize

		const modalRef = this.modalService.open(DataDrivenModalFormSetComponent, modal_param)
		
		label.isOpenedFormSet = true
		
		modalRef.componentInstance.filterStr = search_key
    modalRef.componentInstance.maintype  = label.data.pagetype
		modalRef.componentInstance.pagetype  = label.data.pagetype
		modalRef.componentInstance.endpoint  = label.data.endpoint
		modalRef.componentInstance.buttons   = label.data.buttons
		modalRef.componentInstance.onclick   = label.data.onclick
		modalRef.componentInstance.isSearchModal = true
		
		modalRef.result.then(result => {
			if (result) {
				if (result.item) {
					this.setGridItemToInputs(result.item, label)
				} else {
					this.form.controls[label.fieldname].setValue(this.oldValue[label.fieldname])
				}
			}
			
			label.isOpenedFormSet = false
			this.focusElement = this.getElementFromLabel(label)
			this.setFocus = false
		})
	}

	onSearchEdit(label: FormItemLabel) {
		if (label.isOpenedFormSet) return;
		this.save();

		let modal_param = {centered: true, draggableSelector: '.modal-header'};
		if (label.data.onedit.pagesize && label.data.onedit.pagesize != PageSize.Medium) 
			 modal_param['size'] = label.data.onedit.pagesize;
			 
		let data: any = this.form.value;
		const modalRef = this.modalService.open(DataDrivenModalFormSetComponent, modal_param);
		label.isOpenedFormSet = true;

		let oneditUrl = this.dataDrivenService.replaceFieldsOfUrl(label.data.onedit.endpoint, data.id, data);

		modalRef.componentInstance.id = this.id;
		modalRef.componentInstance.itemid = this.data[label.data.file]['id'];
		modalRef.componentInstance.maintype = label.data.onedit.pagetype;
		modalRef.componentInstance.pagetype = label.data.onedit.pagetype;
		modalRef.componentInstance.endpoint = label.data.endpoint;
		// modalRef.componentInstance.buttons = label.data.onedit.buttons;
		modalRef.componentInstance.onclick = {endpoint: oneditUrl, buttons: label.data.onedit.buttons};

		modalRef.result.then(result => {
			if (result) {
				this.getSearchItem(oneditUrl, data.id, label, data);
			}
			this.focusElement = this.getElementFromLabel(label);
			this.setFocus = false;
			label.isOpenedFormSet = false;
		});
	}

	openCalculator(label: FormItemLabel) {
		let value = this.form.controls[label.fieldname].value;

		const modalRef = this.modalService.open(ModalCalculatorComponent, {centered: true, draggableSelector: '.modal-body', size: 'sm'});

		modalRef.componentInstance.value = value.toString();

		modalRef.result.then(result=>{
			if (result) {
				this.form.controls[label.fieldname].setValue(result);
			}
			this.focusElement = this.getElementFromLabel(label);
			this.setFocus = false;
		});
	}

	onInfoButton(label: FormItemLabel) {
		this.save();

		let modal_param = {centered: true, draggableSelector: '.modal-header'};
		if (label.infobutton.pagesize && label.infobutton.pagesize != PageSize.Medium) 
			 modal_param['size'] = label.infobutton.pagesize;
		
		if (label.infobutton.pagetype == PageType.Calculator ||
			label.infobutton.pagetype == PageType.ModalCalculator) {
				this.openCalculator(label);	
				return;
		}

		if (label.infobutton.pagetype === PageType.TabWebPage) {
			this.openNewTabWebPage(label.infobutton);
			return;
		}
		
		if (label.infobutton.pagetype === PageType.BrowserWebPage) {
			this.openBrowserWebPage(label.infobutton, true);
			return;
		}
		
		if (label.infobutton.pagetype === PageType.ModalWebPage) {
			label.infobutton.buttons.push(ButtonType.Exit);
			this.openModalWebPage(label.infobutton, this.id, false);
			return;
		}

		let data:any = this.form.value;

		const modalRef = this.modalService.open(DataDrivenModalFormSetComponent, modal_param);

		let onInfoUrl = this.dataDrivenService.replaceFieldsOfUrl(label.infobutton.endpoint, data.id, data);

		modalRef.componentInstance.id = this.id;
		modalRef.componentInstance.itemid = label.data ? this.data[label.data.file]['id'] : this.data[label.fieldname];
		modalRef.componentInstance.filterStr = data[label.fieldname].value;
		modalRef.componentInstance.hidefilter = label.infobutton.hidefilter;
		modalRef.componentInstance.maintype = label.infobutton.pagetype;
		modalRef.componentInstance.pagetype = label.infobutton.pagetype;
		modalRef.componentInstance.buttons = label.infobutton.buttons;

		if (label.infobutton.pagetype == PageType.TabGrid
			|| label.infobutton.pagetype == PageType.Grid
			|| label.infobutton.pagetype == PageType.ModalTabGrid
			|| label.infobutton.pagetype == PageType.ModalGrid) {
			modalRef.componentInstance.endpoint = onInfoUrl;
			modalRef.componentInstance.onclick = label.infobutton.onclick;
		} else {
			modalRef.componentInstance.onclick = label.infobutton;
		}

		modalRef.result.then(result=>{
			if (result) {
				// if (result.items) {
				// 	let item = result.items.find(i=> i.id == result.itemid);
				// 	this.setGridItemToInputs(item, label);
				// }
			}
			this.focusElement = this.getElementFromLabel(label);
			this.setFocus = false;
		});
	}

	openAlertModal(title: string, message: string) {
		let modal_param = {centered: true, windowClass: 'alert-modal'};

		const deviceModalRef = this.modalService.open(ModalAlertComponent, modal_param);
		deviceModalRef.componentInstance.title = title;
		deviceModalRef.componentInstance.message = message;

		deviceModalRef.result.then(result=>{
			if (result) {
			}
		});
	}

	setGridItemToInputs(item: any, label: FormItemLabel) {
		let fitler_labels = this.labels.filter(l=>l.data && l.data.file == label.data.file);
		if (!this.data) this.data = {};

		for (let i=0; i<fitler_labels.length; i++) {
			let l = fitler_labels[i];
			let value = item[l.data.fieldname];
			value = typeof(value) == 'string' ? value.trim() : value;
			this.form.controls[l.fieldname].setValue(value);
			// this.oldValue[l.fieldname] = value
			this.data[l.fieldname] = value;
		}

		this.data[label.data.file] = _.cloneDeep(item);

		setTimeout(()=>{
			this.focusElement = this.getElementFromLabel(label);
			this.setFocus = false;
		});
	}
	
	onOpenDropDown (item, label: FormItemLabel) {
		if (label.items.length === 1 && label.items[0].land.trim() === '') {
			this.getFileData(label.grid, label, ``)
		}
	}
	
	onChangeItem(item, label: FormItemLabel) {
		if (!item) {
			this.selectedDropdownItem = false
			this.getFileData(label.grid, label, '');
		}
		
		let tmp = []
		
		if (item) {
			tmp.push(item)
			this.selectedDropdownItem = item
			label.items = tmp
			this.setGridItemToInputs(item, label);
		}
	}

	isValueEmpty(value: any){
		let result = true;
		Object.keys(value).forEach(key=>{
			if (key!="id") result = result && (!value[key] || value[key].trim() =="");
		});

		return result;
	}

	searchFn(term: string, item: any): boolean {
		return true;
	}

	onPhoneCall(phoneNumber: string) {
		window.open(`tel:${phoneNumber}`);
	}

	sendEmail(emailAddress: string) {
		window.open(`mailto:${emailAddress}`);
	}

	getInputType(inputtype: FormItemType) {
		if (this.isNumberFields(inputtype)) {
			return 'number';
		} else if (inputtype == FormItemType.Email) {
			return 'email';
		}

		return 'text';
	}

	isNumberFields(inputtype: FormItemType) {
		return inputtype == FormItemType.Int || 
				inputtype == FormItemType.ReadInt ||
				inputtype == FormItemType.Float || 
				inputtype == FormItemType.ReadFloat ||
				inputtype == FormItemType.Lattitude || 
				inputtype == FormItemType.Longitude;
	}

	isReadFields(inputtype: FormItemType) {
		return inputtype == FormItemType.ReadText || 
				inputtype == FormItemType.ReadInt ||
				inputtype == FormItemType.ReadFloat || 
				inputtype == FormItemType.ReadPhone ||
				inputtype == FormItemType.ReadDate  ||
				inputtype == FormItemType.ReadTime ||
				inputtype == FormItemType.Lattitude ||
				inputtype == FormItemType.Longitude;
	}

	isEmailField(inputtype: FormItemType) {
		return inputtype === FormItemType.Email;
	}

	isReadPhoneFields(inputtype: FormItemType) {
		return inputtype == FormItemType.Phone || 
			inputtype == FormItemType.ReadPhone;
	}

	isDateField(inputtype: FormItemType) {
		return inputtype == FormItemType.ReadDate || 
		inputtype == FormItemType.Date;
	}

	isTimeField(inputtype: FormItemType) {
		return inputtype == FormItemType.Time || 
		inputtype == FormItemType.ReadTime;
	}

	getValue(label: FormItemLabel, value) {
		if (label.inputtype == FormItemType.Float || label.inputtype == FormItemType.ReadFloat) {
			let cValue = Number(parseFloat(value).toFixed(2));
			return cValue;
		} else {
			return value;
		}
	}

	getMask(inputtype: FormItemType) {
		let mask: string;
		switch (inputtype) {
			case FormItemType.Text:
			case FormItemType.ReadText:
				mask = 'A*';
				break;
			case FormItemType.Int:
			case FormItemType.ReadInt:
				mask = '0*';
				break;
			case FormItemType.Float:
			case FormItemType.ReadFloat:
				mask = '0*.00';
				break;
			case FormItemType.Date:
				mask = '00/00/00'
				break;
		}

		return mask;
	}


	getMaxValueFromLength(legnth: number) {
		if (!length && length != 0) return 1;
		return Math.pow(10, legnth) -1;
	}

	
	save() {
		if (_.isEqual(this.oldValue, this.form.value)) return;
		
		
		if (!this.endpoint) {
			let id = this.form.controls['id'].value;
			if (!id || id == -1) this.onCreated.next(this.form.value);
			else this.onUpdated.next(this.form.value);
			return;
		}
		if (!this.data) this.data = {};

		
		Object.keys(this.form.controls).forEach(key => {
			let label = this.labels.find(l => l.fieldname == key);
			if (!label) return;
			this.form.controls[key].setValue(this.convertStringAsPipe(this.form.value[key], label.pipe));
		});

		for (let i=0; i<this.labels.length; i++) {
			let label = this.labels[i];

			if (label.inputtype == FormItemType.Document && this.data[label.fieldname] 
				!= this.form.value[label.fieldname]) {

					this.uploadFile(label, this.form.value[label.fieldname]);
					return;
			}
		}


		let data = this.convertNull(this.form.value);
		if (this.id && this.id != -1) this.updateData(this.endpoint, this.id, data);
		else this.createData(this.endpoint, data);
	}

	convertNull(data) {
		Object.keys(data).forEach(key =>{
			let value = data[key];
				let index = this.labels.findIndex(label=>label.fieldname == key);
				if (!this.labels[index]) return;
				switch (this.labels[index].inputtype ) {
					case FormItemType.Int:
					case FormItemType.ReadInt:
					case FormItemType.Lattitude:
					case FormItemType.Longitude:
					case FormItemType.HiddenInt:
						value = value ? Number(value) : 0;
						break;
					case FormItemType.Float:
					case FormItemType.ReadFloat:
					case FormItemType.HiddenFloat:
						value = value ? Number(value) : 0.00;
						break;
					case FormItemType.Date:
					case FormItemType.ReadDate:
						value = value ? value : "";
						break;
					case FormItemType.CheckBox:
						 value = value ? value : false;
					default:
						value = value ? value : "";
						break;
				}

				data[key]=value;
		});

		return data;
	}

	convertStringAsPipe(value: string, pipe: FormItemPipe) {
		if (typeof(value) !="string" ) return value;
		switch (pipe) {
			case FormItemPipe.LowerCase:
				return value.toLowerCase();
			case FormItemPipe.UpperCase:
				return value.toUpperCase();	
			case FormItemPipe.TitleCase:
				if (!!value) {
					return value.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ');
				}
		}

		return value;
	}

	ok() {
		let onokGrids = this.childGrids.filter(grid => !!grid.onok);

		this.onok_apis_count = onokGrids.length;
		if (this.onclick && this.onclick.endpoint) this.onok_apis_count++;
		onokGrids.forEach(grid=>{
			this.updateGridData(grid.onok.endpoint, this.id, grid.items);
		});

		if (this.onclick) {
			this.labels.forEach(label => {
				this.form.controls[label.fieldname].setValue(this.convertStringAsPipe(this.form.value[label.fieldname], label.pipe));
			});
			this.updateData(this.onclick.endpoint, this.id, this.form.value);
		}
		//this.onSelect.next(this.form.value);
	}
	
	
	clickButtonBar(button: ButtonType) {
		if (button == ButtonType.Save) {
			this.save();
		} else if  (button == ButtonType.Delete) {
			if (!this.endpoint) {
				this.onDeleted.next(this.form.controls['id'].value);
				return;
			}
			this.deleteData(this.endpoint, this.id);
		} else if (button == ButtonType.OK) {
			this.clickedButton = button;
			this.ok();
		} else if (button == ButtonType.Cancel) {
			this.onClickButtonBar.next(ButtonType.Exit);
			this.onExit.next();
		} else if (this.form && 
				!_.isEqual(this.form.value, this.oldValue) && 
				this.buttons.indexOf(ButtonType.Save) > -1) {
					if (this.autoSave) {
						this.clickedButton = button;
						this.save();
					} else {
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
					}
		} else {
			this.ButtonEvent(button);
		}
	}

	formReset() {
		this.id = -1;
		this.form.reset();
		if (this.parent_id!=null && this.parent_id!= -1) {
			this.form.controls['parent_id'].setValue(this.parent_id);
		} 
		this.oldValue = this.form.value;
		this.setFocus = false;
	}

	ButtonEvent(button: ButtonType) {
		switch (button) {
			case ButtonType.Delete:
				break;
			case ButtonType.Save:
				break;

			case ButtonType.Add:
				//this.formReset();
				// break;
			case ButtonType.Edit:
			case ButtonType.View:
			case ButtonType.List:
			case ButtonType.Previous:
			case ButtonType.Next:
				this.onClickButtonBar.next(button);
				this.setFocus = false;
				break;
			case ButtonType.Exit:
				this.onClickButtonBar.next(button);
				this.onExit.next();
				break;
			case ButtonType.Select:
			case ButtonType.OK:
				this.onSelect.next(this.form.value);
				break;
			case ButtonType.Refresh:
				this.refreshForm()
				break
		}

		this.clickedButton = null;
	}

	clickLabelButton(label: FormItemLabel, itemid: any, isdrop: boolean = false) {
		if (label.validation && label.validation !='') {
			this.getValidationData(label.validation, null);
			return;
		}

		if (isdrop && label.ondrop) {
			this.openModalFormSet(label.ondrop, itemid, isdrop);
			return;
		}

		switch (label.onclick.pagetype) {
			case PageType.Form:
      case PageType.Grid:
      case PageType.TabGrid:
			case PageType.TabForm:
			case PageType.Chart:
				this.onChangeView.next({page: label.onclick.pagetype, itemid: itemid, data: this.form.value, onclick: label.onclick.onclick});
        break;
      case PageType.ModalForm:
      case PageType.ModalGrid:
      case PageType.ModalTabGrid:
			case PageType.ModalTabForm:
			case PageType.ModalChart:
			case PageType.PDFView:
			case PageType.ModalPDFView:
        this.openModalFormSet(label.onclick, itemid, isdrop);
				break;
			case PageType.TabWebPage:
				this.openNewTabWebPage(label.onclick);
				break;
			case PageType.ModalWebPage:
				this.openModalWebPage(label.onclick, itemid, isdrop);
				break;
			case PageType.BrowserWebPage:
				this.openBrowserWebPage(label.onclick, true);
				break;
			case PageType.GridRefresh:
				if (label.onclick.refresh) {
					let index = this.labels.findIndex(l=>l.fieldname == label.onclick.refresh);
					this.labels[index].endpoint = label.onclick.endpoint;
				}
				break;
		}
	}

	openNewTabWebPage (onclick: OnClick) {
		const apiUrl = onclick.endpoint;
		const data = [];

		data['btw_nr'] = this.data.btw_nr;
		const externalUrl = this.dataDrivenService.replaceFieldsOfUrl(apiUrl, this.data.btw_nr, data);

		let currentTime = new Date().getTime();
		let tab;

		data['externalUrl'] = externalUrl;

		tab = new Tab( `Tab Page`, `tabWindowTpl`, `${currentTime}`, data);
		this.tabService.openTab(tab);
	}

	openBrowserWebPage (onclick: OnClick, isNewTab: boolean) {
		const apiUrl = onclick.endpoint;
		const data = [];

		data['btw_nr'] = this.data.btw_nr;
		const externalUrl = this.dataDrivenService.replaceFieldsOfUrl(apiUrl, this.data.btw_nr, data);
			
		if (isNewTab) {
			window.open(externalUrl, '_blank');
		} else {
			window.open(externalUrl);
		}
	}

	openModalWebPage (onclick: OnClick, itemid: any, isdrop: boolean) {
		const modalSetting = {
			centered: true,
			draggableSelector: '.modal-header'
		};

		if (onclick.pagesize && onclick.pagesize != PageSize.Medium) {
			modalSetting['size'] = onclick.pagesize;
		}

		const modalRef = this.modalService.open(DataDrivenModalWebPageComponent, modalSetting);

		modalRef.componentInstance.maintype = onclick.pagetype;
		modalRef.componentInstance.pagetype = onclick.pagetype;
		modalRef.componentInstance.title = onclick.title;
		modalRef.componentInstance.id = this.parent_id;
		modalRef.componentInstance.itemid = itemid;
		modalRef.componentInstance.hidefilter = onclick.hidefilter;
		modalRef.componentInstance.onClick = onclick;
		modalRef.componentInstance.linkIndex = this.data.btw_nr;
		modalRef.componentInstance.buttons = onclick.buttons;

		modalRef.result.then(result => {
			if (result) {
				if (isdrop) {
					let droplabel: FormItemLabel = this.labels.find(label => _.isEqual(label.ondrop, onclick));
					if (droplabel && droplabel.onclick && droplabel.onclick.endpoint && droplabel.onclick.endpoint != "") {
						this.clickLabelButton(droplabel, itemid);
					}
				}
			}
		});
	}

	openModalFormSet(onclick: OnClick, itemid: any, isdrop: boolean) {
		let modal_param = { centered: true, draggableSelector: '.modal-header' };
		if (onclick.pagesize && onclick.pagesize != PageSize.Medium) modal_param['size'] = onclick.pagesize;
		if (onclick.pagetype == PageType.PDFView) modal_param['size'] = "xl";

		const modalRef = this.modalService.open(DataDrivenModalFormSetComponent, modal_param);
		
		modalRef.componentInstance.maintype = onclick.pagetype;
		modalRef.componentInstance.pagetype = onclick.pagetype;
		modalRef.componentInstance.title = onclick.title;
		modalRef.componentInstance.id = this.parent_id;
		modalRef.componentInstance.itemid = itemid;
		modalRef.componentInstance.hidefilter = onclick.hidefilter;

    if (onclick.pagetype == PageType.ModalForm) {
      modalRef.componentInstance.onclick = onclick;
    } else if( onclick.pagetype == PageType.ModalTabForm ) {
      modalRef.componentInstance.endpoint = onclick.endpoint;
      modalRef.componentInstance.onclick = { endpoint: `${onclick.endpoint}/form`, buttons: onclick.buttons };
    } else if (onclick.pagetype == PageType.ModalChart) {
			modalRef.componentInstance.form_data = this.form.value;
      modalRef.componentInstance.chart_onclick = { endpoint: onclick.endpoint, buttons: onclick.buttons };
    } else {
			modalRef.componentInstance.endpoint = onclick.endpoint;
			modalRef.componentInstance.buttons = onclick.buttons;
			modalRef.componentInstance.onclick = onclick.onclick;
		}

		modalRef.result.then(result => {
			if (result) {
				if (isdrop) {
					let droplabel: FormItemLabel = this.labels.find(label => _.isEqual(label.ondrop, onclick));
					if (droplabel && droplabel.onclick && droplabel.onclick.endpoint && droplabel.onclick.endpoint != "") {
						this.clickLabelButton(droplabel, itemid);
					}
				}
			}
		});
	}
	
	onGridDataChanged() {
		if (this.rowrefresh) {
			this.getItemData(this.rowrefresh, this.id);
		} 
	}

	onGridBeforeClickButtonBar(label:FormItemLabel, button: ButtonType) {
		this.save();
	}

	onGridRowDropToTarget(event) {
		if (!event.item) return;
		let label: FormItemLabel = JSON.parse(event.target.getAttribute("data-label"));

		let id = event.item.id;

		this.clickLabelButton(label, id, true);
	}

	getLabelDataString(label: FormItemLabel) {
		return JSON.stringify(label);
	}


	getElementFromLabel(label: FormItemLabel) {
		let focusElement = null;
		this.vc.forEach(v => {
			if (v.nativeElement.getAttribute("ng-reflect-name") == label.fieldname) {
				focusElement = v.nativeElement;
				return;
			}
		});
		return focusElement;
	}

	getNgStyle(label: FormItemLabel) {
		let style = !!label.style ? (typeof(label.style) == "string" ? JSON.parse(JSON.stringify(label.style)) : label.style) : {};
		return style;
	}

	onInputFocus(event) { 
		event.target.select();
	}

	onInputChange(label: FormItemLabel, value) {
		if (label.inputtype == FormItemType.Float) {
			let cValue = Number(parseFloat(value).toFixed(2));
			this.form.controls[label.fieldname].setValue(cValue);
		}
	}

	onInputBlur(label: FormItemLabel, event) {
		let value = event.target.value;
		if (label.inputtype == FormItemType.Float) {
			let cValue = Number(parseFloat(value).toFixed(2));
			this.form.controls[label.fieldname].setValue(cValue);
		} else if (label.inputtype == FormItemType.SearchEdit || label.inputtype == FormItemType.Search) {
			if (event && 
				event.relatedTarget && 
				event.relatedTarget.type && 
				event.relatedTarget.type == "button") {
				if (event.relatedTarget.children == 0 ||
					!event.relatedTarget.children[0].classList.contains(ABO_ICONS['1'])) return;
			}
			
			if (!this.data) this.data = {};
			let oValue = this.data[label.fieldname] ? this.data[label.fieldname] : "";//this.data[label.data.file][label.data.fieldname];
			oValue = typeof(oValue) == 'string' ? oValue.trim() : oValue;
			let cValue = typeof(value) == 'string' ? value.trim() : value;

			if (value.trim() =='' || oValue != cValue) this.onSearchGrid(value, label);
			
		}
	}

	convertTime12to24(time) {
		let hours = Number(time.match(/^(\d+)/)[1]);
		let minutes = Number(time.match(/:(\d+)/)[1]);
		let AMPM = time.match(/\s(.*)$/)[1];
		if (AMPM.toLowerCase() == "pm" && hours<12) hours = hours + 12;
		if (AMPM.toLowerCase() == "am" && hours==12) hours = hours - 12;
		let sHours = hours.toString();
		let sMinutes = minutes.toString();
		if(hours<10) sHours = "0" + sHours;
		if(minutes<10) sMinutes = "0" + sMinutes;
		return sHours + ":" + sMinutes;
	}
}
