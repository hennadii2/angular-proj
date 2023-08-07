import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation, ViewChild, SystemJsNgModuleLoaderConfig, EventEmitter, Output, Renderer, HostListener, ElementRef } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { OnClick, ButtonType, PageSize, FormItemLabel, FormItemType, KanbanResourceType, KanbanColumnType, KanbanSourceType } from 'src/app/shared/models/data-driven.model';
import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { FileService } from 'src/app/shared/services/file.service';
import { HttpEventType } from '@angular/common/http';
import { LanguageService, Languages } from 'src/app/shared/services/language.service';




@Component({
	selector: 'app-data-driven-pdfview',
	templateUrl: './pdfview.component.html',
	styleUrls: ['./pdfview.component.scss']
})
export class DataDrivenPDFViewComponent implements OnInit {
	ABO_ICONS = ABO_ICONS;
	ButtonType = ButtonType;
	PageSize = PageSize;

	objectKeys = Object.keys;
	disabled_buttons: ButtonType[]=[ButtonType.Edit];

	@Input() id: any = -1;
	@Input() endpoint: string;
	@Input() buttons: ButtonType[]=[];
	@Input() form_class = '';
	@Input() default_disabled_buttons: ButtonType[]=[];

	@Output() onExit = new EventEmitter();

	@ViewChild('iframePdf') iframePdfEl: ElementRef;
	base64src: any;
	fileName: string = 'document.pdf';
	fileSrc: any;
	currentLang: string = Languages.English;
	currentPdf: any;
	button_corner: number;
	componentDestroyed = new Subject(); // Component Destroy

	constructor(
		private toastrService: NbToastrService,
		private tokenStorage: TokenStorage,
		private fileService: FileService,
		private langService: LanguageService,
		private dataDrivenService: DataDrivenService
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
		this.currentLang = this.langService.getLang();

	}

	ngOnInit() {
		//if (this.id != -1 && this.id != undefined) this.downloadFile(this.id);
	}
	

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['id'] || changes['endpoint']) {
			if (this.endpoint && this.id) this.downloadFile(this.id);
		}
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
		this.componentDestroyed.next();
		this.componentDestroyed.unsubscribe();
	}


	uploadFile(data: any) {
		let formData = new FormData();
		formData.append('file', data, data.name);
		let checkFileType =  data.name.split('.').pop();

		this.fileService.uploadFile(formData).subscribe(event=>{

			if (event.type === HttpEventType.UploadProgress) {
				// label.progress = Math.round(event.loaded / event.total * 100);
			} else if (event.type === HttpEventType.Response) {
				// label.showProgress = false;
				let file = event.body.filename


			}


		}, err=>{
			// label.showProgress = true;

			this.toastrService.danger(err.message, "Error");
		});
	}


	downloadFile(id: any) {
		let passed_url = this.dataDrivenService.replaceFieldsOfUrl(this.endpoint, id);
        this.fileService.downloadFile(passed_url).subscribe(res=>{
            if (res.type === HttpEventType.Response) {
				this.base64src = res.body;

                this.fileName = this.fileService.getFileNameFromHttpResponse(res);
                var contentType = res.headers.get('content-type') || 'application/pdf';
				this.fileSrc = this.fileService.b64toBlob(this.base64src, contentType);
				this.currentPdf = URL.createObjectURL(this.fileSrc);
                // saveAs(blob, returnfilename);
            }

        }, err=>{
			this.toastrService.danger(err.message, "Error");
        });
	}
	
	clickButtonBar(button: ButtonType) {
		console.log(button);
		switch (button) {
			case ButtonType.Print:
				this.print();
				break;
			case ButtonType.Exit:
				this.onExit.next();
				break;
		}
	}


	print() {
		this.iframePdfEl.nativeElement.contentWindow.print();
	}

}
