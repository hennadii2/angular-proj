import { Component, OnInit, SimpleChanges, ViewChild, ViewEncapsulation, ElementRef, Input, Output, EventEmitter, Renderer } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { GridSelectionMode, FormItemType } from 'src/app/shared/models/data-driven.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Packing, PackingProduct, PackingProductBox, PackingProductField, PackingBoxes, PackingUser } from '../packing.model';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { PackingService } from 'src/app/shared/services/packing.service';
import { NgbModal, NgbModalConfig } from 'src/app/shared/ng-bootstrap';
import { ModalLocationComponent } from '../../modals/location/location.component';
import { ModalAlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ModalSerialComponent } from '../../modals/serial/serial.component';
import { ModalPackingWeightComponent } from '../../modals/packing-weight/packing-weight.component';
import { ModalSubProductsComponent } from '../../modals/sub-products/sub-products.component';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { ModalProductBoxComponent } from '../../modals/product-box/product-box.component';

const GRID_MIN_WIDTH = 850;
const MIN_VALUE = 1;
const SEPERATE_LENGTH = 3;
const ROW_HEIGHT = 55;
const FACT_BUTTON_STR = "fact";
const SAVE_BUTTON_STR = "save";
const PRINT_BUTTON_STR = "print";
const ANNULEREN_BUTTON_STR = "annulatie";

@Component({
	selector: 'app-packing-warehouse',
	templateUrl: './warehouse.component.html',
	styleUrls: [	'./warehouse.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PackingWarehouseComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	PackingProductField = PackingProductField;
	GridSelectionMode = GridSelectionMode;
	ROW_HEIGHT = ROW_HEIGHT;

	@Input() infor: Packing;
	@Input() user: PackingUser;
	@Input() logged_user: string;
	origin_products: PackingProduct[]=[];

	@Output() onBack = new EventEmitter();
	@Output() onClose = new EventEmitter();

	MIN_VALUE = MIN_VALUE;
	maxBoxNumber = 1;
	isHideCompleted: boolean = true;
	isFacting: boolean = false;
	isPrinting: boolean = false;
	button_corner: number;

	error_key: string = null;
	product_searchs: string[] = [];
	form: FormGroup;
	isLoadingGrid: boolean = false;

	dataFields: any = [
		{ name: PackingProductField.id, 		type: 'int' },
		{ name: PackingProductField.hoev, 		type: 'int' },
		{ name: PackingProductField.scan, 		type: 'int' },
		{ name: PackingProductField.art_nummer, type: 'string' },
		{ name: PackingProductField.omschr_new, type: 'string' },
        { name: PackingProductField.locatie, 	type: 'string' },
		{ name: PackingProductField.production, type: 'bool' },
		{ name: PackingProductField.stock, 		type: 'int' },
		{ name: PackingProductField.ref, 		type: 'string' }
	];

	gridCellClass = (row: number, columnfield: any, value: number): string => {
		let rowData = this.jqxGrid.getrowdata(row);
        let rowClass = "";
        if (rowData.hoev < rowData.scan) {
			return `${rowClass} bg-danger`;
        } else if (rowData.production) {
            return `${rowClass} bg-success`;
        } else if (rowData.hoev == rowData.scan) {
            return `${rowClass} bg-info`;
        } else {
            return `${rowClass}`;
        }
    }
    
    
    createGridLotnrEditor = (row: number, cellValue: any, editor: any, cellText: any, width: any, height: any): void => {
        editor.jqxComboBox({ autoDropDownHeight: true, source: [], promptText: 'Please Choose:' });
    }

    initGridLotnrEditor = (row: number, cellvalue: any, editor: any, celltext: any, pressedChar: String, callback: any): any => {
        let rowData = this.jqxGrid.getrowdata(row);
        let product = this.infor.products.find(p=> p.art_nummer == rowData.art_nummer);

        if (product.locations && product.locations.length > 0) {
            editor.jqxComboBox('source', product.locations.map(location=>location.maat));
            editor.jqxComboBox('selectItem', cellvalue)
        } else {
            this.getLocations(editor, product, cellvalue);
        }
    }

    lotnrCellValueChanging = (row: number, column: any, columntype: any, oldvalue: any, newvalue: any): any => {
        if (newvalue == ''){
            return oldvalue;
        } else {
            let rowData = this.jqxGrid.getrowdata(row);
            let product = this.infor.products.find(p=> p.art_nummer == rowData.art_nummer);
            product.locatie = newvalue;
        }
        // return the old value, if the new value is empty.
	}
	
	
	scanCellRenderer = (row: number, column: any, value: any): any => {	
		let html = 	`<div class="d-flex align-items-center justify-content-between h-100 w-100">
						<span class="ml-2">${value}</span>
						<div class="mr-2">
							<button type="button" class="btn btn-primary btn-gescand-plus rounded-0"> 
								<span class="${ABO_ICONS['e']}"></span>
							</button>
							
							<button type="button" class="btn btn-primary btn-gescand-reset rounded-0"> 
								<span class="${ABO_ICONS['k']}"></span>
							</button> 
						</div>
					</div>`;

		return html;
	}

	descCellRenderer = (row: number, column: any, value: any): any => {	
		let html = 	`<div class="d-flex align-items-center justify-content-between h-100 w-100">
						<span class="ml-2">${value}</span>
						<button type="button" class="btn btn-primary btn-desc-box rounded-0 mr-2"> 
							<span class="${ABO_ICONS['y']}"></span>
						</button>
					</div>`;

		return html;
	}
	


	columns: any[] =
    [
		{ text: 'id', 			datafield: PackingProductField.id,          hidden: true},
        { text: 'Aantal', 		datafield: PackingProductField.hoev, 		width: 80, filtertype: 'number', editable: false, cellclassname: this.gridCellClass },
        { text: 'Gescand', 		datafield: PackingProductField.scan, 		width: 180, filtertype: 'number', editable: false, columntype: 'numberinput', cellclassname: this.gridCellClass, cellsrenderer:  this.scanCellRenderer },
        { text: 'Artikel', 		datafield: PackingProductField.art_nummer, 	width: 150, filtertype: 'input', editable: false, cellclassname: this.gridCellClass },
        { text: 'Omschrijving', datafield: PackingProductField.omschr_new, 	minwidth: 500, filtertype: 'input', editable: false, cellclassname: this.gridCellClass, cellsrenderer:  this.descCellRenderer },
		{ text: 'Lotnr', 		datafield: PackingProductField.locatie, 	width: 120, filtertype: 'input', editable: false, columntype: 'combobox', cellclassname: this.gridCellClass,
		    createeditor: this.createGridLotnrEditor.bind(this),
            initeditor: this.initGridLotnrEditor.bind(this),
            cellvaluechanging: this.lotnrCellValueChanging.bind(this)
		},
		{ text: 'Stock', 		datafield: PackingProductField.stock, 	width: 80, filtertype: 'number', cellclassname: this.gridCellClass },
		{ text: 'Ref .', 		datafield: PackingProductField.ref, 	width: 120, filtertype: 'input', cellclassname: this.gridCellClass },
	];
	
	gridAdapter: any;
	@ViewChild('boxInput') boxInputField: ElementRef;
	@ViewChild('searchSelect') searchSelectEL: NgSelectComponent;
	@ViewChild('jqxGrid') jqxGrid: jqxGridComponent;

	
	constructor(
		private formBuilder: FormBuilder,
		private renderer: Renderer,
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private packingService: PackingService,
		private modalService: NgbModal,
		private dataDrivenService: DataDrivenService
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
		//this.gridGenerateSource();

	}

	ngOnInit() {
		this.maxBoxNumber = this.getMaxBoxNumber(this.infor.products);

		this.form = this.formBuilder.group({
			box: [1, [Validators.required, Validators.min(MIN_VALUE), Validators.max(this.maxBoxNumber)]],
			product: [{value: '', disabled: true}, Validators.required],
			hoev: [1, [Validators.min(MIN_VALUE)]]
        });

        this.searchSelectEL.filterInput.nativeElement.addEventListener('keydown', (event) => {
            if (event.key == 'Enter') {
                this.searchSelectEL.filterValue = this.searchSelectEL.filterInput.nativeElement.value;
                
                this.onKeyDownSearchSelect(event);
                this.searchSelectEL.filterInput.nativeElement.value = "";
            } else {
                this.searchSelectEL.filterValue = this.searchSelectEL.filterInput.nativeElement.value;
                // if (!this.searchSelectEL.isOpen) this.searchSelectEL.open();
            }
        });
        
	}

	ngAfterViewInit() {
		this.setFocusToSearchSelect();

		if (this.infor.remark && this.infor.remark != "") {
			setTimeout(()=>{this.openAlertModal("Remark", this.infor.remark);});
		}
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['infor']) {
			if (this.infor['products'] && this.infor['products'].length > 0) {
				this.origin_products = _.cloneDeep(this.infor.products);
				this.resetAll();
			}
		}
	}

	ngDoCheck() {
	}

	ngOnDestroy() {

	}


	getLocations(editor: any, product: PackingProduct, cellvalue: any) {
		this.packingService.getProductLocations(product.art_nummer, true).subscribe(res=>{
			if (res.error) {
				// this.toastrService.danger(res.error.type, "Error");
				this.openAlertModal("Error", res.error.type);
				return;
			}
			
            product.locations = res.data;

            editor.jqxComboBox('source', product.locations.map(location=>location.maat));
			editor.jqxComboBox('selectItem', cellvalue);
			
			this.setFocusToSearchSelect();
		}, err=>{
			// this.toastrService.danger(err.message, 'Error');
			this.openAlertModal("Error", err.message);
		})
	}

	getSubProducts(product: PackingProduct) {
		this.packingService.getSubProducts(product.art_nummer, product.hoev).subscribe(res=>{
			if (res.error) {
				this.toastrService.danger(res.error.type, "Error");
				return;
			}
            let subProducts:PackingProduct[] = res.data;
            let items = this.jqxGrid.getrows();
            let index = items.findIndex(item=> item.id == product.id);

            this.jqxGrid.beginupdate();

            let rid = this.jqxGrid.getrowid(index);
            this.jqxGrid.deleterow(rid);

            //_.unionBy(this.infor.products, subProducts, "id");
			this.removeProductSearchs(product);
			
            subProducts.forEach((p, i)=>{
				let hoev = p.hoev;
                p.hoev = hoev * (product.hoev - product.scan);
                p.scan = 0;
				p.omschr_new = p.stock_omschr_n;
				p.box = [] ;
                this.infor.products.push(p);
				this.jqxGrid.addrow(null, _.cloneDeep(p), index + i);
				
				this.product_searchs = _.union(this.product_searchs, this.generateProductSearchs(p));
			});					
			let ins = this.infor.products.findIndex(p=>p.id == product.id);
			this.infor.products[ins].scan = product.hoev;
			// this.infor.products.splice(ins, 1);
			this.infor.products[ins].locatie = 'P0001';

            this.jqxGrid.endupdate();
			this.setFocusToSearchSelect();
		}, err=>{
			this.openAlertModal("Error", err.message);
		})
	}
	
	clickEndPointButton(button) {
		let data = [];
		if (button != ANNULEREN_BUTTON_STR) data = this.infor.products;
		this.packingService.clickPackingButton(this.infor.id, button, data).subscribe(res=>{
			if (res.error) {
				// this.toastrService.danger(res.error.type, "Error");
				this.openAlertModal("Error", res.error.type);
				return;
			}


			if (button == PRINT_BUTTON_STR) {
				let boxes: PackingBoxes = res;
				this.openWeightModal(boxes);
				this.isPrinting = false;
			} else if (button == FACT_BUTTON_STR || button == ANNULEREN_BUTTON_STR) {
				this.onBack.next();
				if (button==FACT_BUTTON_STR) this.isFacting = false;
			}




			this.setFocusToSearchSelect();
		}, err=>{
			if (button == PRINT_BUTTON_STR) this.isPrinting = false;
			if (button==FACT_BUTTON_STR) this.isFacting = false;
			// this.toastrService.danger(err.message, 'Error');
			this.openAlertModal("Error", err.message);
		})
	}



	getGridWidth() : any {
		return 'calc(100% - 2px)';
		// if (document.body.offsetWidth > GRID_MIN_WIDTH) {
		// 	return 'calc(100% - 2px)';
		// }
		// return GRID_MIN_WIDTH;
	}

	getGridHeight() : any {
		return screen.height - 250;
	}

	getMaxBoxNumber(products: any[]) {
		let max_num = 0;
		products.forEach(product =>{
			let value = product['hoev'];

			value = !value ? 0 : (typeof(value)=="number" ? value : parseInt(value, 10));

			max_num += value;
		});

		return max_num;
	}

	decreaseBoxNum() {
		let boxNum = this.form.controls['box'].value;
		
		if (--boxNum < MIN_VALUE) {
			boxNum = MIN_VALUE;
		}

		this.setBoxNumber(boxNum)
		this.setFocusToSearchSelect();
	}

	increaseBoxNum() {
		let boxNum = this.form.controls['box'].value;
		
		if (++boxNum > this.maxBoxNumber) {
			boxNum = this.maxBoxNumber;
		}

		this.setBoxNumber(boxNum);

		this.setFocusToSearchSelect();
	}

	inputBoxNum(event) {
		let boxNum = event.target.value;

		if (boxNum < MIN_VALUE) {
			boxNum = MIN_VALUE
		} else if (boxNum > this.maxBoxNumber) {
			boxNum = this.maxBoxNumber;
		}

		this.form.controls['box'].setValue(boxNum);
    }
    
    onKeydownInputBox(event) {
        if (event.key=='Enter') {
			this.setBoxNumber(this.form.controls['box'].value);
		}
    }

	setBoxNumber(boxNumber: Number) {
		this.form.controls['box'].setValue(boxNumber);
		this.form.controls['product'].setValue(null);
		this.form.controls['hoev'].setValue(1);
		this.setFocusToSearchSelect();
	}


	setFocusToSearchSelect() {
		this.searchSelectEL.focus();
	}

	searchFn(term: string, item: any): boolean {
		let filterSearchs = this.getProductsSearchArray(term, item);
		return filterSearchs.length > 0;
    }

    onKeyDownSearchSelect(event) {
        if (event.key=='Enter') {
			this.error_key = null;
            event.stopImmediatePropagation(); 
            let value = event.target.value;
            if (value.trim() != "" && !isNaN(value) && (value.length <= SEPERATE_LENGTH || value.charAt(0) == '-')) {
                this.searchSelectEL.close();
                this.searchSelectEL.clearModel();
                this.setQuantity(Number(value), null);
            } else {
                let item = this.searchSelectEL.itemsList.markedItem;
                if (item) {
                    this.searchSelectEL.toggleItem(item);
                } else if (this.searchSelectEL.itemsList.selectedItems.length > 0) {
                    item = this.searchSelectEL.itemsList.selectedItems[0];
                    if (item) this.searchSelectEL.toggleItem(item);
                } else {
                    let product = this.getProductFromSearchKey(value);
					if (!product) {
						this.error_key = value;
						this.playWrongSound();
					} else {
						this.selectProductFromSearch(product);
					}

                    this.searchSelectEL.clearModel();
                }
			}

			this.searchSelectEL.close();
        }
    }

	onChangeToSearchSelect(item) {
		if (!item) return;
		//this.form.controls['product'].setValue(item.id);
		let product = this.getProductFromSearchKey(item);
		if (!product) return;
		this.error_key = null;

		this.selectProductFromSearch(product);

		this.searchSelectEL.clearModel();
	}

	onEnterToProductSelect(event) {
	}


	getProductFromSearchKey(search: string) {
		return this.infor.products.find(p => p.art_nummer.trim() == search || (p.search && p.search.indexOf(search) > 0));
	}

	setQuantity(number: Number, product: any) {
		this.form.controls['hoev'].setValue(number);
		this.form.controls['product'].setValue(product);
	}

	selectProductFromSearch(product: PackingProduct) {
		let quantity = parseInt(this.form.controls['hoev'].value);
		let boxNum = parseInt(this.form.controls['box'].value);
		let productId = parseInt(this.form.controls['product'].value);

		if (!product) return;

		if (!productId) {
			this.form.controls['product'].setValue(product.id);
		} else {
			quantity = 1;
			this.setQuantity(quantity, product.id);
		}

		if (product.serial && quantity > 0) {
			this.openSerialModal(product, quantity, boxNum);
		} else {
			this.setProductToBox(product, quantity, boxNum);
		}

	}

	setProductToBox(product: PackingProduct, quantity: number, boxNum: number){

		if (!!product) {
			if (!product.box) product.box = [];

			let boxIndex = product.box.findIndex(b=> b.box == boxNum);
			if (boxIndex > -1) {
				let box: PackingProductBox = product.box[boxIndex];
				box.hoev = box.hoev + quantity;

				if (box.hoev == 0) product.box.splice(boxIndex, 1);
			} else {
				product.box.push({box: boxNum, hoev: quantity});
			}

			product.box = product.box.filter(b=> b.hoev != 0);

			let total = this.getTotalQuantity(product.box);
			product.scan += quantity;
			this.setQuantityToGrid(product);
		}
	}


	getBoxesSize(products: PackingProduct[]) {
		let boxNum = 0;

		products.forEach((product, i)=>{
			product.box.forEach((box, j)=>{
				if (box.box > boxNum) boxNum = box.box;
			});
		});

		return boxNum;
	}


	getTotalQuantity(boxes: PackingProductBox[]) {
		let sum = 0;
		boxes.forEach(box =>{
			sum += box.hoev;
		});

		return sum;
	}

	setQuantityToGrid(product: PackingProduct) {
		if (!this.jqxGrid) return;

		let items = this.jqxGrid.getrows();
		let index = items.findIndex(item=> item.id == product.id);

		if (this.isHideCompleted) {
			if (index < 0 && product.hoev != product.scan) {
				this.addGridRow(product);
			} else if (index >= 0){
				if (product.hoev == product.scan) {
					let rid = this.jqxGrid.getrowid(index);
					this.jqxGrid.deleterow(rid);
				} else {
					this.jqxGrid.setcellvalue(index, PackingProductField.scan, product.scan);
				}
			}
		} else {
			if (index < 0) {
				this.addGridRow(product);
			} else {
				this.jqxGrid.setcellvalue(index, PackingProductField.scan, product.scan);
			}
		}

		this.setFocusToSearchSelect();
	}

	addGridRow(item: any) {
		this.jqxGrid.addrow(null, _.cloneDeep(item));

		this.selectItemById(item.id);
	}

	selectItemById(id: any) {
		if (!this.jqxGrid || !id) return;

		let items = this.jqxGrid.getrows();
		let index = items.findIndex(item=> item.id == id);
		this.selectItemByIndex(index);
	}

	selectItemByIndex(index: number) {
		if (index < 0 || !this.jqxGrid) return;
		this.jqxGrid.selectrow(index);
		this.jqxGrid.ensurerowvisible(index);
	}



	getProductNumberFromId(id) {
		let product: PackingProduct = this.infor.products.find(p => p.id == id);
		return product ? product.art_nummer : "";  
	}

	getProductsSearchArray(term: string, item: any) {
		let searchs :string[] = item.search.filter(s => !!s && s.trim() !="");
		searchs = _.union(item['art_number'], searchs);

		let filterSearchs: string[] = searchs.filter(s => s.toLowerCase().includes(term.toLowerCase()));

		return filterSearchs;
	}

	
	generateProductsSearchs(products: PackingProduct[]) {
		let searchs: string[]=[];
		products.forEach(product=>{
			searchs = _.union(searchs, this.generateProductSearchs(product));
		});

		return searchs;
	}

	generateProductSearchs(product: PackingProduct) {
		let searchs: string[] = [];
		let value = product.art_nummer.trim();
		if (value && value.trim() != "" && searchs.indexOf(value) == -1) searchs.push(value);

		if (product.search && product.search.length > 0) {
			product.search.forEach(sch =>{
				value = sch;
				if (value && value.trim() != "" && searchs.indexOf(value) == -1) searchs.push(value);
			});
		}


		return searchs;
	}

	removeProductSearchs(product: PackingProduct) {
		let searchs = this.generateProductSearchs(product);

		searchs.forEach(search => {
			let index = this.product_searchs.findIndex(s => s == search);
			this.product_searchs.splice(index, 1);
		});		
	}

	generateSubTitles() {
		// return `Producten: ${ this.infor.products.length },  Gescand: ${this.infor.products.filter(p=>p.hoev == p.scan).length}`
		let completed_lines = this.infor.products.filter(p=>p.hoev == p.scan).length;
		let total_lines = this.infor.products.length;
		let completed_pieces = this.infor.products.reduce((preValue, product) => preValue + product.scan, 0);
		let total_pieces = this.infor.products.reduce((preValue, product) => preValue + product.hoev, 0);

		return `Lijnen: ${completed_lines}/${total_lines} - Producten: ${completed_pieces}/${total_pieces}`;
	}

	gridReady = (): void => {
	}
	
	gridRendered = (type: any): void => {
	}


	gridGenerateSource() {
		let products: PackingProduct[] = this.infor.products.filter(p=> p.hoev != p.scan);
		let source: any = {
			localdata: products ? products : [],
			datatype: 'array',
			datafields: this.dataFields
		};

		this.gridAdapter = new jqx.dataAdapter(source);
	}

	onCellDoubleClick(event) {
		let args = event.args;

		if (args.datafield == PackingProductField.locatie) {
			let art_nummer = args.row.bounddata[PackingProductField.art_nummer];
			let location = args.row.bounddata[PackingProductField.locatie];
			let omschr_new = args.row.bounddata[PackingProductField.omschr_new];
			let rowindex = args.rowindex;
			this.openModalLocation(rowindex, art_nummer, omschr_new, location);
		} else if (args.datafield == PackingProductField.scan) {
			let target = args.originalEvent.target;
			if (target.tagName.toLowerCase() !="button" && target.parentElement.tagName.toLowerCase() =="button") {
				target = target.parentElement;
			}
			let id = event.args.row.bounddata.id;
			let product = this.infor.products.find(p=> p.id == id);
			
			let classes = target.getAttribute("class");
			let boxNum = parseInt(this.form.controls['box'].value);

			if (classes.indexOf('btn-gescand-plus') > -1 ) {
				if (product.serial) {
					this.openSerialModal(product, 1, boxNum);
				} else {
					this.setProductToBox(product, 1, boxNum);
				}

				setTimeout(()=>{this.setFocusToSearchSelect();});

			} else if (classes.indexOf('btn-gescand-reset') > -1 ) {
				
				product.box = [];
				if (product.serial) product.serialnumbers = [];
				product.scan = 0;
				this.setQuantityToGrid(product);

				setTimeout(()=>{this.setFocusToSearchSelect();});
			}
		} else if (args.datafield == PackingProductField.omschr_new) {
			let target = args.originalEvent.target;

			if (target.tagName.toLowerCase() !="button" && target.parentElement.tagName.toLowerCase() =="button") {
				target = target.parentElement;
			}

			let id = event.args.row.bounddata.id;
			let product = this.infor.products.find(p=> p.id == id);

			let classes = target.getAttribute("class");
			if (classes.indexOf('btn-desc-box') > -1) {
				this.openProductBoxModal(product);
			}
		}
	}

	onCellBeginEdit(event) {

	}

	isScannedAllProducts() {
		return this.jqxGrid && this.jqxGrid.getrows().length == 0;
	}

	openModalLocation(rowindex: any, art_nummer: any, omschr_new: any, location: any) {
		let modal_param = {centered: true}; //, windowClass: 'location-modal'

		const deviceModalRef = this.modalService.open(ModalLocationComponent, modal_param);
		deviceModalRef.componentInstance.art_nummer = art_nummer;
		deviceModalRef.componentInstance.location = location;
		deviceModalRef.componentInstance.omschr_new = omschr_new;

		deviceModalRef.result.then(result=>{
			if (result) {
				this.jqxGrid.setcellvalue(rowindex, PackingProductField.locatie, result['maat']);
				let rowdata = this.jqxGrid.getrowdata(rowindex);
				let item = this.infor.products.find(p => p.id == rowdata.id);
				item.locatie = result['maat'];
			}

			this.setFocusToSearchSelect();
		});
	}

	
	openSerialModal(product: PackingProduct, quantity: number, boxNum: number) {
		let modal_param = {centered: true, windowClass: 'alert-modal'};

		const deviceModalRef = this.modalService.open(ModalSerialComponent, modal_param);
		deviceModalRef.componentInstance.quantity = quantity;

		deviceModalRef.result.then(result=>{
			if (result) {
				product.serialnumbers = _.union(product.serialnumbers, result);
				this.setProductToBox(product, quantity, boxNum);
			}

			this.setFocusToSearchSelect();
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

			this.setFocusToSearchSelect();
		});
	}

	openWeightModal(boxes: PackingBoxes) {
		let modal_param: any = {centered: true, windowClass: 'alert-modal', size: "lg" };

		const deviceModalRef = this.modalService.open(ModalPackingWeightComponent, modal_param);
		deviceModalRef.componentInstance.infor = boxes;
		deviceModalRef.result.then(result=>{
			if (result) {
				
			}
			this.back();
			//this.setFocusToSearchSelect();
		});
	}

	openSubProductsModal(products: PackingProduct[]) {
		let modal_param: any = {centered: true, windowClass: 'alert-modal', size: "lg" };

		const deviceModalRef = this.modalService.open(ModalSubProductsComponent, modal_param);
		deviceModalRef.componentInstance.products = _.cloneDeep(products);
		deviceModalRef.result.then(products=>{
			if (products && products.length > 0 ) {
				products.forEach(product=>{
					this.getSubProducts(product);
				})
			}

			this.setFocusToSearchSelect();
		});
	}

	openConfirmModal(title: string, message: string, callbackFunc: any) {
		let modal_param = {centered: true, windowClass: 'alert-modal'};

		const deviceModalRef = this.modalService.open(ModalConfirmComponent, modal_param);
		deviceModalRef.componentInstance.title = title;
		deviceModalRef.componentInstance.message = message;

		deviceModalRef.result.then(result=>{
			if (result) {
				callbackFunc();
			}

			this.setFocusToSearchSelect();
		});
	}

	openProductBoxModal(product: PackingProduct) {
		let modal_param = {centered: true, windowClass: 'alert-modal'};

		const deviceModalRef = this.modalService.open(ModalProductBoxComponent, modal_param);
		product.box = _.uniqBy(product.box, PackingProductField.box);
		product.box = product.box.filter(box => box.hoev != 0);

		let prev_sum = product.box.reduce((sum, box)=> sum + box.hoev, 0);

		deviceModalRef.componentInstance.product_box = product.box;

		deviceModalRef.result.then(result=>{
			if (result) {
	
				product.box = result;
				let sum = product.box.reduce((sum, box)=> sum + box.hoev, 0);

				product.scan = product.scan - prev_sum + sum;
				this.setQuantityToGrid(product);
			}
		});
	}


	resetBox(box_number: Number) {
		this.infor.products.forEach(product => {
			let index = product.box.findIndex(b => b.box == box_number);
			if (index > -1) {
				product.scan = product.scan - product.box[index].hoev;
				product.box.splice(index, 1);
				if (product.serial) product.serialnumbers = [];
				this.setQuantityToGrid(product);
			}
		});
	}

	clickResetAll() {
		this.infor.products = _.cloneDeep(this.origin_products);
		this.resetAll();
	}

	resetAll() {
		this.gridGenerateSource();
		this.product_searchs = this.generateProductsSearchs(this.infor['products']);
		if (this.form) this.form.controls['box'].setValue(1);
		setTimeout(()=>{this.setFocusToSearchSelect()});
	}

	

	clickProductie() {
		let packProducts = this.infor.products.filter(product => product.production && product.hoev > product.scan);
		if (packProducts.length == 0) {
			this.openAlertModal("Error", "There is no production.");
			return;
		}
        // packProducts.forEach((product, index) =>{
		// 	if (this.infor.products[index].scan < this.infor.products[index].hoev) {
		// 		this.getSubProducts(product);
		// 	}

		// });
		
		// this.isProductive = true;

		this.openSubProductsModal(packProducts);
	}


	clickSwitchShowAll() {
		this.isHideCompleted = !this.isHideCompleted;

		let completed_products = this.infor.products.filter(p=> p.hoev == p.scan);

		this.isLoadingGrid = true;

		completed_products.forEach(product => {
			this.setQuantityToGrid(product);
		});


		setTimeout(()=>{this.setFocusToSearchSelect();});
		this.isLoadingGrid = false;
	}

	clickSave() {
		this.clickEndPointButton(SAVE_BUTTON_STR);
	}

	clickComplete() {
		if (!this.isScannedAllProducts() || this.isFacting) return;
		this.isFacting = true;
		this.clickEndPointButton(FACT_BUTTON_STR);
	}

	clickPrint() {
		if (!this.isScannedAllProducts() || this.isPrinting)  return;
		this.isPrinting = true;
		this.clickEndPointButton(PRINT_BUTTON_STR);
	}

	clickAnnuleren() {
		this.openConfirmModal("Confirm", "Document annuleren. Bent u zeker?", this.back.bind(this));
	}

	back() {
		this.clickEndPointButton(ANNULEREN_BUTTON_STR);
		//this.onBack.next();
	}

	close() {
		this.onClose.next();
	}

	playWrongSound(){
		let audio = new Audio();
		audio.src = "/assets/audio/wrong_key.mp3";
		audio.load();
		audio.play();
	}
}
