import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import {getFocusableBoundaryElements} from '../util/focus-trap';
import {ModalDismissReasons} from './modal-dismiss-reasons';

@Component({
  selector: 'ngb-modal-window',
  host: {
    '[class]': '"modal fade show d-block" + (windowClass ? " " + windowClass : "")',
    'role': 'dialog',
    'tabindex': '-1',
    '(keyup.esc)': 'escKey($event)',
    '(click)': 'backdropClick($event)',
    '[attr.aria-modal]': 'true',
    '[attr.aria-labelledby]': 'ariaLabelledBy',
  },
  template: `
    <div [class]="'modal-dialog' + (size ? ' modal-' + size : '') + (centered ? ' modal-dialog-centered' : '')" role="document">
        <div class="modal-content"><ng-content></ng-content></div>
    </div>
    `
})
export class NgbModalWindow implements OnInit,
    AfterViewInit, OnDestroy {
  private _elWithFocus: Element;  // element that is focused prior to modal opening
  private _posX: number;
  private _posY: number;

  @Input() ariaLabelledBy: string;
  @Input() backdrop: boolean | string = true;
  @Input() draggableSelector: string = null;
  @Input() centered: string;
  @Input() keyboard = true;
  @Input() size: string;
  @Input() windowClass: string;

  @Output('dismiss') dismissEvent = new EventEmitter();

  constructor(@Inject(DOCUMENT) private _document: any, private _elRef: ElementRef<HTMLElement>) {}

  backdropClick($event): void {
    if (this.backdrop === true && this._elRef.nativeElement === $event.target) {
      this.dismiss(ModalDismissReasons.BACKDROP_CLICK);
    }
  }

  escKey($event): void {
    if (this.keyboard && !$event.defaultPrevented) {
      this.dismiss(ModalDismissReasons.ESC);
    }
  }

  dismiss(reason): void { this.dismissEvent.emit(reason); }

  ngOnInit() { this._elWithFocus = this._document.activeElement; }

  ngAfterViewInit() {
    if (!this._elRef.nativeElement.contains(document.activeElement)) {
      const autoFocusable = this._elRef.nativeElement.querySelector(`[ngbAutofocus]`) as HTMLElement;
      const firstFocusable = getFocusableBoundaryElements(this._elRef.nativeElement)[0];

      const elementToFocus = autoFocusable || firstFocusable || this._elRef.nativeElement;
      elementToFocus.focus();
    }

    if (this.draggableSelector) {
      const draggableArea: HTMLElement = this._elRef.nativeElement.querySelector(this.draggableSelector);
      draggableArea.style.cursor = 'move';
      draggableArea.onmousedown = (e: MouseEvent) => {
        this.startDrag(e);
      };
    }
  }

  ngOnDestroy() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;

    let elementToFocus;
    if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    elementToFocus.focus();
    this._elWithFocus = null;
  }

  private startDrag(e: MouseEvent) {
    const modalDialog: HTMLElement = this._elRef.nativeElement.querySelector('.modal-dialog');
    modalDialog.style.marginTop = modalDialog.offsetTop + 'px';
    modalDialog.style.marginLeft = modalDialog.offsetLeft + 'px';
    modalDialog.style.marginBottom = '0';
    modalDialog.style.marginRight = '0';
    this._posX = e.clientX;
    this._posY = e.clientY;

    document.onmousemove = (event) => {
      this.dragModal(event);
    };
    document.onmouseup = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };
  }

  private dragModal(e: MouseEvent) {
    const modalDialog: HTMLElement = this._elRef.nativeElement.querySelector('.modal-dialog');
    const deltaX = this._posX - e.clientX;
    const deltaY = this._posY - e.clientY;
    const top: number = parseInt(modalDialog.style.marginTop.split('px')[0], 10);
    const left: number = parseInt(modalDialog.style.marginLeft.split('px')[0], 10);
    let marginTop = modalDialog.offsetTop - deltaY;
    let marginLeft = modalDialog.offsetLeft - deltaX;
    let marginBottom = window.innerHeight - modalDialog.offsetTop - modalDialog.offsetHeight + deltaY;
    let marginRight = window.innerWidth - modalDialog.offsetLeft - modalDialog.offsetWidth + deltaX;

    if (marginTop < 0) {
     // marginTop = 0;
    // } else if (marginBottom < 0) {
    //   marginTop = window.innerHeight - modalDialog.offsetHeight;
    } else {
      //this._posY = e.clientY;
    }

    this._posY = e.clientY;
    
    if (marginLeft < 0) {
      marginLeft = 0;
    } else if (marginRight < 0) {
      marginLeft = modalDialog.offsetLeft;
    } else {
      this._posX = e.clientX;
    }


    modalDialog.style.marginTop = marginTop + 'px';
    modalDialog.style.marginLeft = marginLeft + 'px';

    //modalDialog.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

}
