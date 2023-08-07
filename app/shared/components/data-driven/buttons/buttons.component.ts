import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { FormItemType, ButtonType } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';

@Component({
	selector: 'app-data-driven-buttons',
	templateUrl: './buttons.component.html',
	styleUrls: ['./buttons.component.scss']
})
export class DataDrivenButtonsComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;

	FormItemType = FormItemType;
	ButtonType = ButtonType;

	button_corner: number;

	@Input() buttons: ButtonType[]=[]
	@Input() disabled_buttons: ButtonType[] = []
	@Input() is_icon: boolean = false
	@Input() isRefreshButtonEnabled: boolean = false
	
	@Output() onClick = new EventEmitter();

	
	constructor(
		private tokenStorage: TokenStorage
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
	}

	ngOnDestroy() {

	}

	clickButton(button: ButtonType) {
		this.onClick.next(button);
	}
}
