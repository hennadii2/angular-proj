import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { ABO_ICONS } from '../../constants/abo-icons';
const DEFAULT_HEIGHT = 200;
@Component({
    selector: 'app-image-upload',
    templateUrl: 'image-upload.component.html',
    styleUrls: ['image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {

    ABO_ICONS = ABO_ICONS;
    DEFAULT_HEIGHT = DEFAULT_HEIGHT;

    @Input() imageSrc: string = '';    
    @Input() activeColor: string = 'green';
    @Input() baseColor: string = '#ccc';
    @Input() overlayColor: string = 'rgba(255,255,255,0.5)';
    @Input() height = 200;
    @Input() required = false;
    @Input() readOnly = false;
    
    @Output() onChange = new EventEmitter<string>();

    iconColor: string;
    borderColor: String;
    
    dragging: boolean = false;
    loaded: boolean = false;
    imageLoaded: boolean = false;
    // imageSrc: string = '';
    ngOnInit() {

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
      // If this is read_image input type, then disable image change event
      if (this.readOnly) {
        alert('Image editing is disabled!')
        
        return
      }
    
      var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

      if (!file) return;

      var pattern = /image-*/;
      var reader = new FileReader();

      if (!file.type.match(pattern)) {
          alert('invalid format');
          return;
      }

      this.loaded = false;

      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsDataURL(file);
    }
    
    _handleReaderLoaded(e) {
        var reader = e.target;
        this.imageSrc = reader.result;
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
    
}