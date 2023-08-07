import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[onTab]'
})
export class OnTabDirective {
    private el: ElementRef;
    @Input() onTab: string;
    constructor(private _el: ElementRef) {
        this.el = this._el;
    }
    @HostListener('keydown', ['$event']) onKeyDown(e) {        
        switch (e.key || e.which || e.keyCode) {
            case 9:
            case "Tab":                
                e.preventDefault();
                let control = e.srcElement;
                let formElement = this.el.nativeElement;
                let inputElements: any[] = formElement.querySelectorAll("input, select, checkbox, textarea");
                let position: number = -1;
                inputElements.forEach((el, index) => {
                    if (el == control) {
                        position = index;
                    }
                });

                if (position == -1) return;

                while (true) {

                    if (e.shiftKey) {
                        position = (position + inputElements.length - 1 ) % inputElements.length;
                        control = inputElements[ position ];
                    } else {
                        position =  ++position % inputElements.length;                   
                        control = inputElements[ position ];
                    }


                    if ((control.type != "hidden") && ((typeof (control.readOnly) !== "undefined" && !control.readOnly) || (typeof (control.readOnly) == "undefined"))) {
                        let classPos = -1;
                        control.classList.forEach((cl, index) => {
                            if (cl == "d-none") {
                                classPos = index;
                            }
                        });
                        if (classPos == -1) {
                            control.focus();
                            if (control.type != "button") control.select();
                            return;
                        }
                    }
                }
            default:
                return;
        }
    }
}