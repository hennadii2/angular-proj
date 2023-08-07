import { Component, OnInit, SimpleChanges, ViewChild, ViewEncapsulation, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { PackingService } from 'src/app/shared/services/packing.service';
import { NumberInputKeys } from 'src/app/shared/models/number-key-inputs.model';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { ModalAlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { PickingUser } from '../picking.model';

const MAX_DOCUMENT_NUMBER = 9999999;

@Component({
	selector: 'app-picking-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PickingSearchComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	NumberInputKeys = NumberInputKeys;
	
	@Input() title: string;
	@Input() endpoint: string;
	@Input() onclick: any;

	@Output() onProductsFound = new EventEmitter();
	@Output() onClose = new EventEmitter();
	users: PickingUser[] = [];
	button_corner: number;

	form: FormGroup;
	@ViewChild('docInput') docInputField: ElementRef;

	constructor(
		private formBuilder: FormBuilder,
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private packingService: PackingService,
		private dataDrivenService: DataDrivenService,
		private modalService: NgbModal
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
		this.form = this.formBuilder.group({
			persoon: ['', Validators.required],
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
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['endpoint']) {
			if (this.endpoint && this.endpoint !="" ) this.getUsers(this.endpoint);
		}
	}

	ngDoCheck() {
	}

	ngOnDestroy() {

	}


	getUsers(url: string) {
		this.dataDrivenService.getData(url).subscribe(res=>{
			
			if (res.error) {
				// this.toastrService.danger(res.error.type, "Error");
				this.openAlertModal("Error",  res.error.type);
			}
			
			this.users = res.data;
			this.setFocusDocInput();
			//if (this.users && this.users.length > 0)  this.form.controls['persoon'].setValue(this.users[0].persoon);
			
		}, err=>{
			this.users = [];
			this.setFocusDocInput();
			this.toastrService.danger(err.message, 'Error');
		})
	}

	getProducts(url: string, data: any) {
		this.dataDrivenService.updateData(url, data).subscribe(res=>{
			this.form.controls['document'].setValue('');
			this.form.controls['persoon'].setValue('');
			this.setFocusDocInput();
			if (res.error) {
				// this.toastrService.danger(res.error.type, "Error");
				this.openAlertModal("Error",  res.error.type);
				return;
			}

			this.onProductsFound.next(res);

		}, err=>{
			this.form.controls['document'].setValue('');
			this.form.controls['persoon'].setValue('');
			this.setFocusDocInput();
			this.toastrService.danger(err.message, 'Error');
		})
	}

	clickUser(user: any) {
		this.form.controls['persoon'].setValue(user.persoon);
		this.searchProducts();
	}

	openAlertModal(title: string, message: string) {
		let modal_param = {centered: true, windowClass: 'alert-modal'};

		const deviceModalRef = this.modalService.open(ModalAlertComponent, modal_param);
		deviceModalRef.componentInstance.title = title;
		deviceModalRef.componentInstance.message = message;

		deviceModalRef.result.then(result=>{
			if (result) {
			}

			setTimeout(()=>{this.setFocusDocInput();});
		});
	}
	

	searchProducts() {
		this.setFocusDocInput();
		if (this.form.invalid) return;
		this.getProducts(this.onclick.endpoint, this.form.value);
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
	}


	close() {
		this.onClose.next();
	}

}
