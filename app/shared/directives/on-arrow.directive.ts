import { Directive, ElementRef, HostListener, Input } from'@angular/core';
@Directive({
    selector: '[onArrow]'
})
export class OnArrowDirective {
    private el: ElementRef;
    @Input() onArrow: string;
    constructor(private _el: ElementRef) {
        this.el = this._el;
    }
    @HostListener('keydown', ['$event']) onKeyDown(e) {
        switch(e.key || e.which || e.keyCode){
            case 38 :
            case "Up" :
            case "ArrowUp" :
            case 40 :
            case "Down" :
            case "ArrowDown" :
                    let control = e.srcElement;
                    let formElement = this.el.nativeElement;
                    let inputElements:any[] = formElement.querySelectorAll("input, select, checkbox, textarea");
                    let position: number = -1;
                    inputElements.forEach(( el, index ) => {                  
                        if (el == control) {
                            position = index;
                        }
                    });
                    
                    if (position == -1) return;
                    if (control.type == 'textarea') return;

                    e.preventDefault();
                    while (true){
                        
                        switch(e.which || e.keyCode || e.key){
                            case 38 :
                            case "Up" :
                            case "ArrowUp" :
                                position = (position + inputElements.length - 1 ) % inputElements.length;
                                control = inputElements[ position ];
                                break;
                            case 40 :
                            case "Down" :
                            case "ArrowDown" : 
                                position =  ++position % inputElements.length;                   
                                control = inputElements[ position ];
                                break;
                            default :
                                return;
                                //break;
                        }
                        
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

            default :
                return;
        }

    }
}