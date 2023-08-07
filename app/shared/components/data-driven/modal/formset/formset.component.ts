import { Component, OnInit, SimpleChanges } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { ButtonType, OnClick, PageType, TypeView } from 'src/app/shared/models/data-driven.model';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';

@Component({
	selector: 'app-data-driven-modalformset',
	templateUrl: './formset.component.html',
	styleUrls: ['./formset.component.scss']
})
export class DataDrivenModalFormSetComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;
	objectKeys = Object.keys;
	PageType = PageType;
	
	title: string;
	maintype: PageType = PageType.ModalGrid;
	pagetype: PageType = PageType.ModalGrid;
	oldpage: PageType;
	id = -1;
	itemid = -1;
	items: any[];
	endpoint = null;
	rowrefresh: string;
	onclick: OnClick = null;
	chart_onclick: OnClick = null;
	buttons: ButtonType[] = [];
	filterStr: string = "";
	hidefilter: boolean;
	groupable: boolean;
	hidefilterrow: boolean;
	fieldheight: number;
	form_data: any;
	draggable: boolean;
	typeview: TypeView[] = [];
	isSearchModal: boolean
	
	position: 'top' | 'bottom';

	componentDestroyed = new Subject(); // Component Destroy
	constructor(
		public activeModal: NgbActiveModal,
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService
	) {
	}

	ngOnInit() {
		this.maintype = this.convertPageType(this.maintype);
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
	}

	ngDoCheck() {
		if ( this.oldpage != this.pagetype ) {
			this.oldpage = this.pagetype;
			this.pagetype = this.convertPageType(this.pagetype);
		}
	}


	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}

	changeView(pagetype: PageType) {
		this.pagetype = pagetype;
	}

	select(params: any) {
		this.activeModal.close(params);
	}

	close(param: any) {
		this.activeModal.close({items: param.items, item: param.item, itemid: param.itemid});
		//this.activeModal.close(null);
	}

	convertPageType(pagetype: PageType) {
		let page = pagetype;
		switch (pagetype) {
            case PageType.ModalForm:
                page = PageType.Form;
                break;
            case PageType.ModalGrid:
                page = PageType.Grid;
                break;
            case PageType.ModalTabGrid:
                page = PageType.Grid;
				break;
			case PageType.ModalTreeGrid:
				page = PageType.TreeGrid;
				break;
            case PageType.ModalTabForm:
                page = PageType.TabForm;
                break;
            case PageType.ModalChart:
                page = PageType.Chart;
				break;
			case PageType.ModalKanban:
				page = PageType.Kanban;
				break;
			case PageType.ModalScheduler:
				page = PageType.Scheduler;
				break;
			case PageType.ModalTimeline:
				page = PageType.Timeline;
				break;
			case PageType.ModalPDFView:
				page = PageType.PDFView;
				break;
		}
		
		return page;
	}

	_isFormSet() {
		return !!this.maintype
			&& !!this.pagetype
			&& this.maintype != PageType.BrowserWebPage
			&& this.maintype != PageType.ModalBrowserWebPage;
	}

	_isIframe() {
		return (!!this.maintype && !!this.pagetype)
			&& (this.maintype == PageType.BrowserWebPage || this.maintype == PageType.ModalBrowserWebPage);
	}
}
