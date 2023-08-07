import { Component, OnInit, Output, EventEmitter, ElementRef, Renderer, Input, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { ButtonType } from '../../models/data-driven.model';
import { ABO_ICONS } from '../../constants/abo-icons';
import { NumberInputKeys } from '../../models/number-key-inputs.model';
import { NgControl } from '@angular/forms';




@Component({
	selector: 'app-num-keypad',
	templateUrl: './num-keypad.component.html',
	styleUrls: ['./num-keypad.component.scss']
})
export class NumKeypadComponent implements OnInit {
	ButtonType = ButtonType;
	ABO_ICONS = ABO_ICONS;
	NumberInputKeys = NumberInputKeys;
	
	isOpen: boolean = true;

	@Input() collapsible = false;
	@Output() onKeypress = new EventEmitter;
	activeElement: any;

	constructor(
		private elRef: ElementRef, 
		private renderer: Renderer
	) {
	}

	ngOnInit() {
	}

	ngDoCheck() {
		if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
			if (!(document.activeElement as any).readOnly) this.activeElement = document.activeElement;
		}

	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['collapsible']) {
			if (!this.collapsible) this.isOpen = true;
		}
	}

	clickKey(key: NumberInputKeys) {
		let type = this.activeElement.getAttribute("type");
		if (this.activeElement.tagName=="INPUT" && type!="text") this.activeElement.setAttribute("type", "text");
		
		let value: string = this.activeElement.value;
		let isEnter = false;
		let keyboardEvent: any;
		let selectionStart = this.activeElement.selectionStart;
		let selectionEnd = this.activeElement.selectionEnd;

		let cursorPos = selectionStart;

		switch (key) {
			case NumberInputKeys.BackSpace:
				if (cursorPos != null) {
					if (selectionEnd == selectionStart) {
						if (selectionStart > 0) {
							value = value.substring(0, selectionStart - 1) + value.substr(selectionStart);
							cursorPos--;
						} 
					} else {
						value = value.substring(0, selectionStart) + value.substr(selectionEnd);
					}
				} else {
					value = value.substring(0, value.length - 1);
				}


				keyboardEvent = new KeyboardEvent('keydown',  {key: "Backspace"});
				break;
			case NumberInputKeys.Enter:
				isEnter = true;
				keyboardEvent = new KeyboardEvent('keydown', {key: "Enter"});
				break;
			case NumberInputKeys.Nine:
			case NumberInputKeys.Eight:
			case NumberInputKeys.Seven:
			case NumberInputKeys.Six:
			case NumberInputKeys.Five:
			case NumberInputKeys.Four:
			case NumberInputKeys.Three:
			case NumberInputKeys.Two:
			case NumberInputKeys.One:
			case NumberInputKeys.Zero:
				if (cursorPos != null) {
					value = value.substring(0, selectionStart)+ key + value.substr(selectionEnd);
					cursorPos++;
				} else {
					value = `${value}${key}`;
				}

				keyboardEvent = new KeyboardEvent("keydown", { key: (48 + parseInt(key)).toString()});
				break;
			case NumberInputKeys.Dot:
			case NumberInputKeys.Minus:
				if (cursorPos != null) {
					value = value.substring(0, selectionStart)+ key + value.substr(selectionEnd);
					cursorPos++;
				} else {
					value = `${value}${key}`;
				}
				keyboardEvent = new KeyboardEvent("keydown", {key: key});
				break;
			case NumberInputKeys.ZoomIn:
				this.isOpen = true;
				break;
			case NumberInputKeys.ZoomOut:
				this.isOpen = false;
				break;

		}


		

		this.activeElement.value = value;

		if (cursorPos != null) {
			setTimeout(() => {this.setCaretPosition(this.activeElement, cursorPos);});
		} else {
			this.activeElement.focus();
		}
		
		if (this.activeElement.tagName=="INPUT" && type!="text") this.activeElement.setAttribute("type", type);

		if (!isEnter ) {
			if (!this.isNgSelectInput()) this.activeElement.dispatchEvent(new Event('input'));
			else if (keyboardEvent) this.activeElement.dispatchEvent(keyboardEvent);
		}  else {
			//this.activeElement.dispatchEvent(new Event('input'));
			this.activeElement.dispatchEvent(keyboardEvent);
		}



	}

	isNgSelectInput() {
		return this.activeElement.parentElement.getAttribute("class")=="ng-input";
	}


	setCaretPosition(element, caretPos) {
		// Modern browsers
		if (element.setSelectionRange) {
			element.focus();
			if (element.type !== 'time' && element.type !== 'month' && element.type !== 'number') {
				element.setSelectionRange(caretPos, caretPos);
			}
			// IE8 and below
		} else if (element.createTextRange) {
			var range = element.createTextRange();
			range.collapse(true);
			range.moveEnd('character', caretPos);
			range.moveStart('character', caretPos);
			range.select();
		}
	}
}