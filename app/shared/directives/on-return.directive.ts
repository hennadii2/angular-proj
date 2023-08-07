import { Directive, ElementRef, HostListener, Input } from'@angular/core';
@Directive({
    selector: '[onReturn]'
})
export class OnReturnDirective {
    private el: ElementRef;
    @Input() onReturn: string;
    constructor(private _el: ElementRef) {
        this.el = this._el;
    }
    @HostListener('keydown', ['$event']) onKeyDown(e) {
        if ((e.key == "Enter" || e.which == 13 || e.keyCode == 13)) {

           let control:any;
            control = e.srcElement;
            let formElement = this.el.nativeElement;
            let inputElements:any[] = formElement.querySelectorAll("input, select, checkbox, textarea");
            let position: number = -1;
            inputElements.forEach(( el, index ) => {  
                // We'll need to know the position where the elements is placed
                if (el == control) {
                  position = index;
                }
            });

            if (position == -1) return;
            if (control.type == 'textarea') return;

            e.preventDefault();
            
            while (true){
                position = ++position % inputElements.length;
                control = inputElements[ position ];   

                if ((control.type != "hidden") && ((typeof (control.readOnly) !== "undefined" && !control.readOnly) || (typeof (control.readOnly) == "undefined"))) {
                    let classPos = -1;
                    control.classList.forEach( (cl, index) => {
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
        }
    }
}