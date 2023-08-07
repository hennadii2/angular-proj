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

@Component({
	selector: 'app-packing-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PackingUsersComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;

	@Input() endpoint: string;


	@Output() onSelectUser = new EventEmitter();
	@Output() onClose = new EventEmitter();


	selected_user: PackingUser;
	users: PackingUser[] = [];
	button_corner: number;

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
			
		}, err=>{
			this.users = [];
			this.toastrService.danger(err.message, 'Error');
		})
	}


	clickUser(user: PackingUser) {
		this.selected_user = user;
		
		this.onSelectUser.next(this.selected_user);
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

	close() {
		this.onClose.next();
	}

}
