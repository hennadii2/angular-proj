import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { ABO_ICONS } from '../../constants/abo-icons';
import * as _ from 'lodash';
import { TokenStorage } from '../../authentication/token-storage.service';
import { DataDrivenService } from '../../services/data-driven.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { FileService } from '../../services/file.service';
import { saveAs } from 'file-saver';

const DEFAULT_HEIGHT = 200;
@Component({
    selector: 'app-file-upload',
    templateUrl: 'file-upload.component.html',
    styleUrls: ['file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

    ABO_ICONS = ABO_ICONS;
    DEFAULT_HEIGHT = DEFAULT_HEIGHT;

    @Input() file="a.mp4";
    @Input() activeColor: string = 'green';
    @Input() baseColor: string = '#ccc';
    @Input() overlayColor: string = 'rgba(255,255,255,0.5)';
    @Input() height = 200;
    @Input()  required=false;
    @Input() progress: number = 0;

    @Output() onChange = new EventEmitter<string>();

    iconColor: string;
    borderColor: String;
    
    dragging: boolean = false;
    loaded: boolean = false;

    orginFile: any;
    button_corner: number;
    @ViewChild('fileInput') fileInputEL: ElementRef;
    constructor(
        private tokenStorage: TokenStorage,
        private toastrService: NbToastrService,
        private fileService: FileService
	) {
		this.button_corner = this.tokenStorage.getButtonCornder();
	}

    ngOnInit() {

    }

    downloadFile(filename: string) {
        let endpoint = `/download/${filename}`;
        this.fileService.downloadFile(endpoint).subscribe(res=>{
            if (res.type === HttpEventType.Response) {
                let data = res.body;
                let returnfilename = this.fileService.getFileNameFromHttpResponse(res);
                var contentType = res.headers.get('content-type') || 'application/octet-stream';
                let blob = this.fileService.b64toBlob(data, contentType);
                saveAs(blob, returnfilename);
                // var url = window.URL.createObjectURL(blob);
                // var a = document.createElement('a');
                // document.body.appendChild(a);
                // a.setAttribute('style', 'display: none');
                // a.href = url;
                // a.download = returnfilename;
                // a.click();
                // window.URL.revokeObjectURL(url);
                // a.remove(); // remove the element
            }

        }, err=>{
			this.toastrService.danger(err.message, "Error");
        });
    }

    ngOnChanges(changes: SimpleChanges) {
		if (changes['file']) {
			this.orginFile = _.cloneDeep(this.file);
		}
	}
    
    handleDragEnter() {
        this.dragging = true;
    }
    
    handleDragLeave() {
        this.dragging = false;
    }
    
    handleDrop(e) {
        e.preventDefault();
        event.stopPropagation();
        this.dragging = false;
        this.handleInputChange(e);
    }

    handleInputChange(e) {
        let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        
        if (!file) return;
        this.file = file;
        this.progress = 0;
        this.onChange.next(this.file);
    }

    removeFile(event) {
        event.preventDefault();
        event.stopPropagation();
        this.progress = 0;
        this.fileInputEL.nativeElement.value = null;
        this.file = _.cloneDeep(this.orginFile);
        this.onChange.next(this.file);
    }

    uploadFile() {

    }

    
    _setActive() {
        this.borderColor = this.activeColor;
        if (!!this.file) {
            this.iconColor = this.activeColor;
        }
    }
    
    _setInactive() {
        this.borderColor = this.baseColor;
        if (!!this.file) {
            this.iconColor = this.baseColor;
        }
    }

    IsObjectType(value) {
        return typeof(value) == 'object';
    }

    IsStringType(value) {
        return typeof(value) == 'string';
    }
    
}