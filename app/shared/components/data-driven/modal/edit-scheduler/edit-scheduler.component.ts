import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { ButtonType, OnClick, FormItemType, FormItemLabel, KanbanSourceType, KanbanColumnType, SchedulerAppointmentField } from 'src/app/shared/models/data-driven.model';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { columnsByPin } from '@swimlane/ngx-datatable/release/utils';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';
import { DataDrivenFormComponent } from '../../form/form.component';
import * as moment from 'moment';

const DATE_FORMAT = 'DD/MM/YY';
const TIME_FORMAT = 'HH:mm';
const DT_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;


@Component({
	selector: 'app-data-driven-modal-edit-scheduler',
	templateUrl: './edit-scheduler.component.html',
	styleUrls: ['./edit-scheduler.component.scss']
})
export class DataDrivenModalEditSchedulerComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;

	is_add: boolean = false;
	//form: FormGroup;
	buttons: ButtonType[] = [ButtonType.Save, ButtonType.Delete, ButtonType.Exit];
	labels: FormItemLabel[];
	blocks: any[]=[];
	converted_labels: FormItemLabel[];
	appointment_fields: any;
	data: any;
	@ViewChild('editForm')	editForm: DataDrivenFormComponent;
	is_createdForm = false;
	componentDestroyed = new Subject(); // Component Destroy
	constructor(
		public activeModal: NgbActiveModal,
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private formBuilder: FormBuilder
	) {

	}

	ngOnInit() {
		if (this.is_add) {
			this.buttons.splice(1, 1);
		}

		this.converted_labels = this.convertLabels(this.labels);
	}

	ngAfterViewInit() {

	}
	
	ngOnChanges(changes: SimpleChanges) {
	}

	ngDoCheck() {
		if (!this.is_createdForm && this.editForm && this.editForm.form) {
			this.is_createdForm = true;
			
			let fromDateField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.FromDate]];
			let fromTimeField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.FromTime]];
			let toDateField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.ToDate]];
			let toTimeField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.ToTime]];

			fromDateField.valueChanges.subscribe(value=>{
				this.changeDateTimeFields(fromDateField, fromDateField, fromTimeField, toDateField, toTimeField);
			})
			fromTimeField.valueChanges.subscribe(value=>{
				this.changeDateTimeFields(fromTimeField, fromDateField, fromTimeField, toDateField, toTimeField);
			});
			toDateField.valueChanges.subscribe(value=>{
				this.changeDateTimeFields(toDateField, fromDateField, fromTimeField, toDateField, toTimeField);
			});
			toTimeField.valueChanges.subscribe(value=>{
				this.changeDateTimeFields(toTimeField, fromDateField, fromTimeField, toDateField, toTimeField);
			});
		}
	}

	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}

	close() {
		this.activeModal.close();
	}
	
	save() {
		// if (this.form.valid) {
		// 	const values = this.form.value;
		// 	this.activeModal.close(values);
		// }
	}

	convertLabels(labels: FormItemLabel[]) {
		labels.forEach((label, index)=>{
			switch (label.widgettype)  {
				case SchedulerAppointmentField.ResourceId:
					labels[index].length = 1;
					//this.data[labels[index].fieldname] = this.data['status'];
					break;
			}
		});

		return labels;
	}

	afterCreate(item: any) {
		if (this.editForm.form.invalid || !this.datetimeValid()) {
			this.toastrService.danger("Please update all fields correctly.", "Error");
			return;
		}
		this.activeModal.close({operation:"create", item: item});
	}
	afterUpdate(item: any) {
		if (this.editForm.form.invalid || !this.datetimeValid()) {
			this.toastrService.danger("Please update all fields correctly.", "Error");
			return;
		}
		this.activeModal.close({operation:"update", item: item});
	}

	afterDelete(itemid: any) {
		this.activeModal.close({operation:"delete", itemid: itemid});
	}

	clickButtonBar(button: ButtonType) {
		switch (button) {
			case ButtonType.Exit:
				this.activeModal.close();
				break;
		}
	}

	datetimeValid() {
		let fromDateField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.FromDate]];
		let fromTimeField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.FromTime]];
		let toDateField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.ToDate]];
		let toTimeField = this.editForm.form.controls[this.appointment_fields[SchedulerAppointmentField.ToTime]];

		if (fromDateField.invalid || fromTimeField.invalid || toDateField.invalid || toTimeField.invalid) {
			return false;
		} else if (!fromDateField.value || fromDateField.value.trim() == "" ||
			!fromTimeField.value || fromTimeField.value.trim() == "" ||
			!toDateField.value || toDateField.value.trim() == "" ||
			!toTimeField.value || toTimeField.value.trim() == "") {
			return false;
		}

		return true;
	}

	changeDateTimeFields(selectedField: any, fromDateField: any, fromTimeField: any, toDateField: any, toTimeField: any) {
		if (selectedField.invalid) {
			return;
		}

		let updateStatus: boolean = false;
		if (fromDateField.invalid || fromTimeField.invalid || toDateField.invalid || toTimeField.invalid) {
			updateStatus = true;
		}

		let fromDate = fromDateField.value;
		let fromTime = fromTimeField.value;
		let toDate = toDateField.value;
		let toTime = toTimeField.value;

		let from = moment(`${fromDate} ${fromTime}`, DT_FORMAT);
		let to = moment(`${toDate} ${toTime}`, DT_FORMAT);
		
		if (from.isAfter(to) || from.isSame(to)) updateStatus = true;

		if (!updateStatus) return;
		
		if (selectedField == fromDateField || selectedField == fromTimeField) {
			to = from.add(30, 'minutes');
			let dateStr = moment(to).format(DATE_FORMAT);
			let timeStr = moment(to).format(TIME_FORMAT);

			toDateField.setValue(dateStr);
			toTimeField.setValue(timeStr);
		} else if (selectedField == toDateField ||selectedField == toTimeField) {
			from = to.subtract(30, 'minutes');

			let dateStr = moment(from).format(DATE_FORMAT);
			let timeStr = moment(from).format(TIME_FORMAT);

			fromDateField.setValue(dateStr);
			fromTimeField.setValue(timeStr);
		}

	}
}
