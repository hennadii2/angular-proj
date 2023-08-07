import * as _ from 'lodash';
import { Component, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ButtonType, OnClick, PageType, TypeView } from 'src/app/shared/models/data-driven.model';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';

@Component({
	selector: 'app-data-driven-modal-web-page',
	templateUrl: './modal-web-page.component.html',
	styleUrls: ['./modal-web-page.component.scss']
})
export class DataDrivenModalWebPageComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;
	objectKeys = Object.keys;
	PageType = PageType;
	buttons: ButtonType[]=[];
	title: string;
	maintype: PageType = PageType.ModalGrid;
	pagetype: PageType = PageType.ModalGrid;
	oldpage: PageType;
	id = -1;
	itemid = -1;
	onClick: OnClick = null;
	hidefilter: boolean;
	position: 'top' | 'bottom';
	linkIndex: string;
	data: any;
	externalUrl: string = "";
	disabled_buttons: ButtonType[] = [];

	componentDestroyed = new Subject(); // Component Destroy

	@Output() onExit = new EventEmitter();

	constructor (
		public activeModal: NgbActiveModal,
		private dataDrivenService: DataDrivenService
	) { }

	ngOnInit() {
		const apiUrl = this.onClick.endpoint;
		const data = [];
		
		data['btw_nr'] = this.linkIndex;
		this.externalUrl = this.dataDrivenService.replaceFieldsOfUrl(apiUrl, this.linkIndex, data);
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

	close(param: any) {
		this.activeModal.close({
			items: param.items,
			item: param.item,
			itemid: param.itemid
		});
	}

	clickButtonBar (buttonType: ButtonType) {
		switch (buttonType) {
			case ButtonType.Exit:
				this.activeModal.close();
				break;
		}
	}
}
