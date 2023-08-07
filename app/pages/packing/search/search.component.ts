import { Component, OnInit, SimpleChanges, ViewChild, ViewEncapsulation, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { PackingUser, Packing, PackingProductField } from '../packing.model';
import { NumberInputKeys } from 'src/app/shared/models/number-key-inputs.model';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { ModalAlertComponent } from 'src/app/shared/modals/alert/alert.component';
import * as moment from 'moment';
import { ModalConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';

const MAX_DOCUMENT_NUMBER = 9999999;
const DATE_FORMAT = 'DD/MM/YY';

@Component({
	selector: 'app-packing-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PackingSearchComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	NumberInputKeys = NumberInputKeys;

	@Input() onclick: any;
	@Input() user: PackingUser;
	@Input() logged_user: string;
	
	@Output() onFoundProducts = new EventEmitter();
	@Output() onChangeUser = new EventEmitter();
	@Output() onClose = new EventEmitter();
	
	
	button_corner: number;

	form: FormGroup;
	currentUser: string;
	@ViewChild('docInput') docInputField: ElementRef;
	isOpenConfirmModal: boolean = false;
	constructor(
		private formBuilder: FormBuilder,
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private dataDrivenService: DataDrivenService,
		private modalService: NgbModal
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
		this.form = this.formBuilder.group({
			document: ['', [Validators.required, Validators.maxLength(7)]]
		});
		

		// this.docInputField.nativeElement.addEventListener('numberkeyinput', (event) => {
		// 	event.preventDefault();
		// 	if (event.detail.enter == true) {
		// 		this.searchProducts();
		// 	} else {
		// 		let value = event.detail.value;
		// 		let oldValue = this.form.controls['document'].value
		// 		if (value != oldValue) this.form.controls['document'].setValue(event.detail.value);
		// 	}
		// });
	}

	ngAfterViewInit() {
		//this.docInputField.nativeElement.focus();
		this.setFocusDocInput();
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['user']) {
			this.setFocusDocInput();
		}
	}

	ngDoCheck() {
	}

	ngOnDestroy() {

	}


	getProducts(url: string, data: any) {
		this.dataDrivenService.updateData(url, data).subscribe(res=>{
			this.setFocusDocInput();
			if (res.error) {
				// this.toastrService.danger(res.error.type, "Error");
				setTimeout(()=>{this.openAlertModal("Error",  res.error.type)});
				return;
			}
			
			res.products = _.orderBy(res.products, [PackingProductField.locatie]);
			
			let date = moment(res.date, DATE_FORMAT, true);

			if (!this.isOpenConfirmModal && date.isValid() && (date.format(DATE_FORMAT) != moment().format(DATE_FORMAT)) ) {
				let message = `Leveringsdatum op ${date.format(DATE_FORMAT)}. Toch inpakken?`;
				this.openConfirmModal("Confirm", message, res);
			} else {
				this.onFoundProducts.next(res);
			}

		}, err=>{
			this.setFocusDocInput();
			this.toastrService.danger(err.message, 'Error');
		})
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

	openConfirmModal(title: string, message: string, data: Packing) {
		this.isOpenConfirmModal = true;
		let modal_param = {centered: true, windowClass: 'alert-modal'};

		const deviceModalRef = this.modalService.open(ModalConfirmComponent, modal_param);
		deviceModalRef.componentInstance.title = title;
		deviceModalRef.componentInstance.message = message;

		deviceModalRef.result.then(result=>{
			if (result) {
				this.isOpenConfirmModal = false;
				this.onFoundProducts.next(data);
			}
		});
	}
	

	searchProducts() {
		this.setFocusDocInput();
		if (this.form.invalid) return;
		let data = {persoon: this.user.persoon, document: this.form.controls['document'].value};
		this.getProducts(this.onclick.endpoint, data);
	}

	setFocusDocInput() {
		this.docInputField.nativeElement.focus();
		this.docInputField.nativeElement.select();
	}
	
	onKeyDownDocumentInput(event) {
	 	if (event.key=='Enter') {
			this.searchProducts();
		}
	}

	onInput(event) {
		// console.log(event);
	}

	clickChangeUser() {
		this.onChangeUser.next();
	}


	close() {
		this.onClose.next();
	}

}
