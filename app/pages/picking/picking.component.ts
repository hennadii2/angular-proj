import { Component, ViewChild, OnInit, OnDestroy, Injector, Inject, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { NbToastrService } from '@nebular/theme';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { Picking } from './picking.model';
import { NumberInputKeys } from 'src/app/shared/models/number-key-inputs.model';


interface FsDocument extends HTMLDocument {
	mozFullScreenElement?: Element;
	msFullscreenElement?: Element;
	fullscreenElement: Element;
	webkitFullscreenElement?: Element;
	webkitExitFullscreen?:() => void;
	msExitFullscreen?: () => void;
	mozCancelFullScreen?: () => void;
}

interface FsDocumentElement extends HTMLElement {
	msRequestFullscreen?: () => void;
	mozRequestFullScreen?: () => void;
	webkitRequestFullscreen?: () => void;
}

enum PickingView {
	Search = "search"
}

@Component({
    selector   : 'app-picking',
    templateUrl: './picking.component.html',
    styleUrls  : ['./picking.component.scss']
})
export class PickingComponent implements OnInit, OnDestroy{
	PickingView = PickingView;

	elem;
	@Input() title: string;
	@Input() endpoint: string;
	@Input() onclick: any;
	@Output() onClose = new EventEmitter();
	pickingView: PickingView = PickingView.Search;
	productsInfor: Picking = null;

    constructor(
		@Inject(DOCUMENT) private document: any,
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private dataDrivenService: DataDrivenService
    ) {
		this.elem = document.documentElement;
    }


	ngOnInit() {
			 this.setFullScreen(true);
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['endpoint']) {
		}
	}

	ngOnDestroy() {
		this.setFullScreen(false);
	}

	productsFound(data: Picking) {
		this.productsInfor = data;
	}

	goSearch() {
		this.pickingView = PickingView.Search;
	}

	close() {
		this.onClose.next();
	}

	isFullScreen(): boolean {
		const fsDoc = <FsDocument> document;
  
		return !!(fsDoc.fullscreenElement || fsDoc.mozFullScreenElement || fsDoc.webkitFullscreenElement || fsDoc.msFullscreenElement);
	}
  
  

	toggleFullScreen(): void {
		const fsDoc = <FsDocument> document;
  
		if (!this.isFullScreen()) {
		  const fsDocElem = <FsDocumentElement> document.documentElement;
  
		  if (fsDocElem.requestFullscreen)
			fsDocElem.requestFullscreen();
		  else if (fsDocElem.msRequestFullscreen)
			fsDocElem.msRequestFullscreen();
		  else if (fsDocElem.mozRequestFullScreen)
			fsDocElem.mozRequestFullScreen();
		  else if (fsDocElem.webkitRequestFullscreen)
			fsDocElem.webkitRequestFullscreen();
		}
		else if (fsDoc.exitFullscreen)
		  fsDoc.exitFullscreen();
		else if (fsDoc.msExitFullscreen)
		  fsDoc.msExitFullscreen();
		else if (fsDoc.mozCancelFullScreen)
		  fsDoc.mozCancelFullScreen();
		else if (fsDoc.webkitExitFullscreen)
		  fsDoc.webkitExitFullscreen();
	  }
  
	  setFullScreen(full: boolean): void {
		if (full !== this.isFullScreen())
		  this.toggleFullScreen();
	  }

}

