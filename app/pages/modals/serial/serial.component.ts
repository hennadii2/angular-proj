import { Component, OnInit, ViewEncapsulation, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { TagInputComponent } from 'ngx-chips';

@Component({
  	selector: 'app-modal-serial',
  	templateUrl: './serial.component.html',
	styleUrls: ['./serial.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalSerialComponent implements OnInit {

	serials: any[]=[];
	serial: string;
	quantity: number = 1;
	button_corner: number;

	@ViewChild('serialsInput') serialsInputEl: TagInputComponent;
	constructor(
		private tokenStorage: TokenStorage,
		public activeModal: NgbActiveModal) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {

	}

	ngAfterViewInit() {
		setTimeout(()=>{this.serialsInputEl.inputForm.input.nativeElement.focus();}, 100);

	}

	getTitle() {
		return `Serial Number ${this.quantity} - Gescand: ${this.serials.length}`;
	}

	onKeydownSerial(event) {
		if (event.key=='Enter') {
			this.check();
		}
	}

	onItemAdded(event) {
		this.check();
	}

	check() {
		if (this.serials.length > 0 && this.serials.length == this.quantity) {
			this.activeModal.close(this.serials.map(s=> s.value));
		}
	}
  
}
