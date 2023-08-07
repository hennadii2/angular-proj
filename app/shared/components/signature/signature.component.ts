import { Component, OnInit, SimpleChanges, ViewChild, ViewEncapsulation, ElementRef, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { TokenStorage } from '../../authentication/token-storage.service';

@Component({
	selector: 'app-signature',
	templateUrl: './signature.component.html',
	styleUrls: ['./signature.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SignatureComponent implements OnInit, AfterViewInit {
	
	signaturePadOptions: Object = {
		'minWidth': 1,
		'maxWidth:': 1, 
		'canvasWidth': 300,
		'canvasHeight': 150
	};

	color: string="#000000";
	isViewInit: boolean = false;
	@Input() signdata: any;
	@Input() refresh: boolean = false;
	@Input() height: number;
	@Input() readOnly: boolean = false;
	
	@Output() onChangeData = new EventEmitter();

	@ViewChild(SignaturePad) signaturePad: SignaturePad;
	@ViewChild('sign_container') signContainer: ElementRef;

	button_corner: number;
	componentDestroyed = new Subject(); // Component Destroy

	constructor(
		private formBuilder: FormBuilder,
		private toastrService: NbToastrService,
		private dataDrivenService: DataDrivenService,
		private deviceService: DeviceDetectorService,
		private tokenStorage: TokenStorage
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

	ngOnInit() {

	}

	ngAfterViewInit() {
		//this.load();

		this.isViewInit = true;
		this.onResize();
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['signdata'] && this.refresh && this.isViewInit) {
			this.load();
		}
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}

	drawSignStart() {
		// If this is read_signature input type, then disable signature create / change event
		if (this.readOnly) {
			alert('Signature editing is disabled!')
			
			return
		}
	}
	
	drawSignComplete() {
		this.save();
	}

	resizeSignature(width){
		if (!this.signaturePad || !this.isViewInit) return;
		this.signaturePad.set('canvasWidth', width);
		this.signaturePad.set('canvasHeight', this.height && typeof(this.height) == "number" ? this.height * 33 : width/2);
		this.load();
	}

	onChangeWidth(width: number) {
		this.signaturePad.set('maxWidth', width);
		this.signaturePad.set('velocityFilterWeight', 0.05);
	}

	changeColor(color: string) {
		this.signaturePad.set('penColor', color);
	}
		
	clear() {
		this.signaturePad.clear();
		this.save();
	}

	undo() {
		var data = this.signaturePad.toData();
		if (data) {
		  data.pop(); // remove the last dot or line
		  this.signaturePad.fromData(data);
		  this.save();
		}
	}

	save() {
		this.signdata = this.signaturePad.toDataURL();
		//this.onChangeData.next(JSON.stringify(this.signdata));
		this.onChangeData.next(this.signdata);
	}

	load() {	
		this.signaturePad.clear();
		if (this.signdata /*&& this.IsJsonString(this.signdata)*/) {
			//this.signaturePad.fromData(JSON.parse(this.signdata));
			this.signaturePad.fromDataURL(this.signdata);
		}
	}

	onResize() {
		if (!this.signContainer) return;
		let width = this.signContainer.nativeElement.offsetWidth;
		this.resizeSignature(width);
	}

	IsJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}
}
