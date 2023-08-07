import { Component, ViewChild, OnInit, OnDestroy, Injector, Inject, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { NbToastrService } from '@nebular/theme';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { Packing, PackingUser } from './packing.model';
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

enum PackingView {
	Users = "users",
	Search = "search",
	Warehouse = "warehouse"
}

@Component({
    selector   : 'app-packing',
    templateUrl: './packing.component.html',
    styleUrls  : ['./packing.component.scss']
})
export class PackingComponent implements OnInit, OnDestroy{
	PackingView = PackingView;

	elem;
	@Input() title: string;
	@Input() endpoint: string;
	@Input() onclick: any;
	@Output() onClose = new EventEmitter();

	selected_user: PackingUser;
	logged_user: string;
	
	packingView: PackingView = PackingView.Users;
	productsInfor: Packing = null;

    constructor(
		@Inject(DOCUMENT) private document: any,
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private dataDrivenService: DataDrivenService
    ) {
		this.elem = document.documentElement;
		this.logged_user = atob(this.tokenStorage.getCurrentUser());
		this.logged_user = this.logged_user ? this.logged_user.split(":")[0] : "";
		console.log(this.logged_user);
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

	onSelectUser(user: PackingUser) {
		this.selected_user = user;

		this.packingView = PackingView.Search;
	}

	onFoundProducts(data: Packing) {
		this.productsInfor = data;
		this.packingView = PackingView.Warehouse;
	}

	onChangeuser() {
		this.packingView = PackingView.Users;
	}

	goSearch() {
		this.packingView = PackingView.Search;
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

