import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[autocomplete]'
})
/**
 * Alterates autocomplete="off" atribute on chrome because it's ignoring it in case of credentials, address or credit card data type.
 */
export class AutocompleteDirective implements OnInit {
  private _chrome = navigator.userAgent.indexOf('Chrome') > -1;
  constructor(private _el: ElementRef) {}
  ngOnInit() {
    if (this._chrome) {
      if (this._el.nativeElement.getAttribute('autocomplete') === 'off') {
        setTimeout(() => {
          this._el.nativeElement.setAttribute('autocomplete', 'offoff');
        });
      }
    }
  }
}