import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { ABO_ICONS } from '../../constants/abo-icons';

@Component({
    selector: 'app-image-cropper-upload',
    templateUrl: 'image-cropper-upload.component.html',
    styleUrls: ['image-cropper-upload.component.scss']
})
export class ImageCropperUploadComponent implements OnInit, OnChanges {

    ABO_ICONS = ABO_ICONS;
    @Input()  dfaultImgSrc: string;
    @Input()  imageSrc: string;
    @Input()  width:number;
    @Input()  height:number;
    @Input()  types:any[]=[];
    @Input()  required=false;
    @Input() activeColor: string = 'green';
    @Input() baseColor: string = '#ccc';
    @Input() overlayColor: string = 'rgba(255,255,255,0.5)';


    @Output() onChange = new EventEmitter<any>();

    ratio = 1;
    iconColor: string;
    borderColor: String;
    
    dragging: boolean = false;
    loaded: boolean = false;
    imageLoaded: boolean = false;

    originalImage: any = '';
    cropperReady = false;
    previousImage = null;
    @ViewChild('fileInput') fileInput;
    constructor() {}
    ngOnInit() {

    }
    
    ngOnChanges(changes: SimpleChanges) {
		if (changes['imageSrc']) {
            if (this.imageSrc) this.previousImage = this.imageSrc;
        }

        if (changes['width'] || changes['height']) {
            if (this.width && this.height) this.ratio = this.width / this.height;
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
    
    handleImageLoad() {
        this.imageLoaded = true;
        this.iconColor = this.overlayColor;
    }

    handleInputChange(e) {
        var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

        if (!file) return;

        var pattern = /image-*/;
        var reader = new FileReader();

        if (!file || !file.type.match(pattern)) {
            alert('invalid format');
            return;
        }

        this.loaded = false;

        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsDataURL(file);

    }
    
    _handleReaderLoaded(e) {
        var reader = e.target;
        if (reader.result) this.originalImage = reader.result;
        //this.changeEvent();


    }

    imageCropped(image: string) {
        //if (image.indexOf('data:,') > -1) return;
        if (!this.originalImage) return;
        this.imageSrc = image;
    }

    loadImageFailed(image: string) {
    }

    imageLoadedEvent() {
        this.cropperReady = true;
    }

    imageLoadFailed() {
        
    }
    
    changeEvent() {
        this.originalImage = ''
        this.onChange.next(this.imageSrc);
        this.loaded = true;
    }

    _setActive() {
        this.borderColor = this.activeColor;
        if (this.imageSrc.length === 0) {
            this.iconColor = this.activeColor;
        }
    }
    
    _setInactive() {
        this.borderColor = this.baseColor;
        if (this.imageSrc.length === 0) {
            this.iconColor = this.baseColor;
        }
    }

    save() {
        this.fileInput.nativeElement.value='';
        this.cropperReady = false;
        this.changeEvent();
    }
    
    cancel() {
        this.fileInput.nativeElement.value='';
        this.cropperReady = false;
        this.originalImage = '';
        this.imageSrc = this.previousImage;
    }
}