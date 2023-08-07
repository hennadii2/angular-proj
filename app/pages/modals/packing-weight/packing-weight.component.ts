import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { PackingBoxes } from '../../packing/packing.model';
import { PackingService } from 'src/app/shared/services/packing.service';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { ModalAlertComponent } from 'src/app/shared/modals/alert/alert.component';

enum BoxWeightFormField {
	Pallet = "pallet",
	BoxesSize = "boxesSize",
	Box = "box", 
	PaymentCondition = "paymentcondition",
	DeliveryCondition = "deliverycondition"
}

const MIN_VALUE = 0;
const SENDBPOST_BUTTON_STR = "verstuurBPOST";
const SENDPOSTNL_BUTTON_STR = "verstuurPOSTNL";

@Component({
	selector: 'app-modal-packing-weight',
	templateUrl: './packing-weight.component.html',
	styleUrls: ['./packing-weight.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalPackingWeightComponent implements OnInit {
	BoxWeightFormField = BoxWeightFormField;

	@Input() infor: PackingBoxes;
	@Input() lblTotalWeight: number = 0;
	@Input() lblCondition:  string = '';

	form: FormGroup;
	boxes: FormArray;
	button_corner: number;
	button_height: number;

	constructor(
		private tokenStorage: TokenStorage,
		private formBuilder: FormBuilder,
		private packingService: PackingService,
		private modalService: NgbModal,
		public activeModal: NgbActiveModal) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {		
		this.lblCondition += "Betalingscond.: ";
		this.lblCondition += !!this.infor.paymentcondition && this.infor.paymentcondition != "" ? this.infor.paymentcondition : "";
		this.lblCondition += " / Leveringscond.: ";
		this.lblCondition += !!this.infor.deliverycondition && this.infor.deliverycondition != "" ? this.infor.deliverycondition : "";

		for (let i = 0; i < this.infor.boxes; i++) {
			this.lblTotalWeight += this.infor.box[i][1];
		}

		this.form = this.formBuilder.group({
			pallet: [this.infor.pallet, [Validators.required, Validators.min(MIN_VALUE)]],
			boxesSize: [this.infor.boxes, [Validators.required, Validators.min(MIN_VALUE)]],
			boxes: this.formBuilder.array([])			
		});

		for (let i = 0; i < this.infor.boxes; i++) {
			let weight = this.infor.box[i][1];
			this.addBox(weight);
		}

		this.button_height = 65;
	}

	addBox(weight: number) {
		const boxes = this.form.controls.boxes as FormArray;
		boxes.push(this.formBuilder.group({
			weight: [weight, [Validators.required, Validators.min(MIN_VALUE)]],
		}));
	}

	yes() {
		this.activeModal.close();
	}

	closeModal() {
		this.activeModal.close();
	}

	SendToBPost() {
		this.clickEndPointButton(SENDBPOST_BUTTON_STR);
	}

	SendToPostNL() {
		this.clickEndPointButton(SENDPOSTNL_BUTTON_STR);
	}	

	clickEndPointButton(button) {
		let data = [];

		data.push({ "id": this.infor.id });
		for (let item in this.form.controls) {
			data.push(this.form.controls[item].value);
		}

		this.packingService.clickPackingButton(this.infor.id, button, data).subscribe(res => {
			if (res.error) {
				this.openAlertModal("Error", res.error.type);
				return;
			} else if (res.message){
				this.openAlertModal("Info", res.message);
				return;
			}
		})
		this.activeModal.close();
	}

	openAlertModal(title: string, message: string) {
		let modal_param = { centered: true, windowClass: 'alert-modal' };

		const deviceModalRef = this.modalService.open(ModalAlertComponent, modal_param);
		deviceModalRef.componentInstance.title = title;
		deviceModalRef.componentInstance.message = message;

		deviceModalRef.result.then(result => {
			if (result) {
			}
		});
	}

	valueChange(newValue: number, id: number) {
		this.lblTotalWeight = 0;

		if (!isNaN(newValue)) {
			this.infor.box[id][1] = newValue;
		} else {
			newValue = 0;
		}

		for (let i = 0; i < this.infor.boxes; i++) {
			this.lblTotalWeight += this.infor.box[i][1];
		}
	}

}