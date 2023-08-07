import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { ButtonType, OnClick, FormItemType, FormItemLabel, KanbanSourceType, KanbanColumnType } from 'src/app/shared/models/data-driven.model';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { columnsByPin } from '@swimlane/ngx-datatable/release/utils';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';

@Component({
	selector: 'app-data-driven-modal-edit-kanban',
	templateUrl: './edit-kanban.component.html',
	styleUrls: ['./edit-kanban.component.scss']
})
export class DataDrivenModalEditKanbanComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;
	KanbanColumnType = KanbanColumnType;

	is_add: boolean = false;
	//form: FormGroup;
	
	status: any;
	columns: any[];
	labels: FormItemLabel[];
	blocks: any[]=[];
	converted_labels: FormItemLabel[];
	data: any;

	componentDestroyed = new Subject(); // Component Destroy
	constructor(
		public activeModal: NgbActiveModal,
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private formBuilder: FormBuilder
	) {

	}

	ngOnInit() {
		// this.form = this.formBuilder.group({		
		// 	title		: ['', [Validators.required]],
		// 	content		: ['', []],
		// 	status		: [this.status, [Validators.required]]
		// });
		this.converted_labels = this.convertLabels(this.labels);
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}
	getOptionsFromColumns(columns: any[]) {
		let options: any[] = [];
		columns.forEach(column =>{
			let disabled = 
				column[KanbanColumnType.MaxItems] && 
				( 
					(this.is_add && column[KanbanColumnType.MaxItems] <= column[KanbanColumnType.CurrentItems]) ||
					(
						!this.is_add && 
						(
							column[KanbanColumnType.MaxItems] < column[KanbanColumnType.CurrentItems] ||
							(
								column[KanbanColumnType.MaxItems] == column[KanbanColumnType.CurrentItems] &&
								this.data['status'] != column[KanbanColumnType.DataField]
							)
							) 
						)
				);
			
			//is_add-> 
			//let disabled = column[KanbanColumnType.MaxItems];
			
			let option = { option: `${column.text}`, value: column.dataField, disabled: disabled};
			options.push(option);
		});

		return options;
	}

	convertLabels(labels: FormItemLabel[]) {
		labels.forEach((label, index)=>{
			switch (label.kanbantype)  {
				case KanbanSourceType.Status:
					labels[index].inputtype = FormItemType.ComboBox;
					labels[index].options = this.getOptionsFromColumns(this.columns);
					//this.data[labels[index].fieldname] = this.data['status'];
					break;
			}
		});

		return labels;
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

	afterCreate(item: any) {
		this.activeModal.close(item);
	}
	afterUpdate(item: any) {
		this.activeModal.close(item);
	}

	afterDelete(itemid: any) {

	}

	clickButtonBar(button: ButtonType) {
		switch (button) {
			case ButtonType.Exit:
				this.activeModal.close();
				break;
		}
	}
}
