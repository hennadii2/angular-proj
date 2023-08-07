import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ButtonType } from '../../models/data-driven.model';
import { TokenStorage } from '../../authentication/token-storage.service';
import { ABO_ICONS } from '../../constants/abo-icons';
import * as math from 'mathjs'


const MAX_DIGIT_NUMBER = 12;
export enum Operator {
	None = 'none',
	MemoryRecall = 'mr',
	MemoryClear = 'mc',
	MemoryPlus = 'm+',
	MemoryMinus = 'm-',
	MemorySave = 'ms',

	AllClear = 'c',
	Clear = 'ce',
	BackSpace = 'backspace',

	RightParenthesis = '(',
	LeftParenthsis = ')',

	SquareRoot = 'sqrt',
	Square = 'squre',
	XDivider = 'xdivider',

	Divide = '/',
	Multiply = '*',
	Minus = '-',
	Plus = '+',
	Percent = '%',

	Dot = '.',
	Equal = 'equal'
}

@Component({
	selector: 'app-calculator',
	templateUrl: './calculator.component.html',
	styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {
	ButtonType = ButtonType;
	ABO_ICONS = ABO_ICONS;
	Operator = Operator;

	@Output() onCancel = new EventEmitter();
	@Output() onOk = new EventEmitter();

	evalExpress: string = ""
	@Input() value: string = '0';

	lastInput: string = '0';

	memoryValue: string = null;
	constructor(
		private deviceService: DeviceDetectorService,
		private tokenStorage: TokenStorage
	) {
	}

	ngOnInit() {
		this.value = Number(this.value).toString();
		this.lastInput = this.value;
	}

	ok() {
		this.onOk.next(this.value);
	}

	cancel() {
		this.onCancel.next();
	}

	handleKeyDown(event) {
		switch (event.key) {
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				this.clickNumber(event.key);
				break;

			case '+':
			case '-':
			case '*':
			case '/':
			case '%':
			case '.':
				this.clickOperator(event.key);
				break;
			case 'Enter':
			case '=':
				this.clickOperator(Operator.Equal);
				break;
			case 'Backspace':
				this.clickOperator(Operator.BackSpace);
				break;
			case 'Escape':
				this.cancel();
				break;
		}
	}


    clickNumber(num: string) {
		if (this.isOneOperator(this.lastInput)) return;
		if (this.isNumber(this.lastInput) && this.value != '0') {
			if (this.value.length > MAX_DIGIT_NUMBER) return;
			this.value = this.value  + num;
		} else {
			this.value = num;
		}

		this.lastInput = num;
	}
	
	clickOperator(operator: Operator) {
		let temp;
		switch (operator)  {
			case Operator.MemoryClear:
				this.memoryValue = null;
				break;
			case Operator.MemoryMinus:
				this.memoryValue = (Number(this.memoryValue) - Number(this.value)).toString();
				this.lastInput = this.value;
				break;
			case Operator.MemoryPlus:
				this.memoryValue = (Number(this.memoryValue) + Number(this.value)).toString();
				break;
			case Operator.MemoryRecall:
				this.value = this.memoryValue;
				this.lastInput = this.value;
				break;
			case Operator.MemorySave:
				this.memoryValue = this.value;
				break;
			
			case Operator.Dot:
				if (this.isNumber(this.lastInput) && !this.hasDot(this.value)) {
					this.value += Operator.Dot;
					this.lastInput = Operator.Dot;
				}
				break;

			case Operator.AllClear:
				this.value = '0';
				this.evalExpress = "";
				this.lastInput = '0';
				break;
			case Operator.Clear:
				this.value = '0';
				this.lastInput = '0';
				break;

			case Operator.BackSpace:
				if (this.isNumber(this.lastInput)) {
					if (this.value.length <= 1) {
						this.value = '0';
						this.lastInput = '0';
					} else {
						this.value = this.value.slice(0, -1);
						this.lastInput = this.value[this.value.length - 1];
					}
				}
				break;

			case Operator.Percent:
				this.value = (Number(this.value) / 100.0).toString();
				this.lastInput = operator;
				break;

			case Operator.Square:
				if (!this.lastInput.endsWith('0')) {
					this.evalExpress += `${this.value}^2`;
					this.value = Math.pow(Number(this.value), 2).toString();
					this.lastInput = operator;
				}
				break;

			case Operator.SquareRoot:
				this.evalExpress += `sqrt(${this.value})`;
				this.value = Math.sqrt(Number(this.value)).toString();
				this.lastInput = operator;
				break;

			case Operator.XDivider:
				this.evalExpress += `1/(${(this.value)})`;
				this.value = (1.0 / Number(this.value)).toString();
				this.lastInput = operator;
				break;



			case Operator.Plus:
			case Operator.Minus:
			case Operator.Multiply:
			case Operator.Divide:
				if (this.isOneOperator(this.lastInput) ) {
					this.evalExpress += operator;
				} else if (!this.isNumberWithOutDot(this.lastInput)){
					this.evalExpress = this.evalExpress.slice(0, -1);
					this.evalExpress += operator;
				} else {
					temp = this.evalExpress + this.value + operator;
					this.value = this.evaluate(this.evalExpress + this.value);
					this.evalExpress = temp;
				}
				
				this.lastInput = operator;
				break;

			case Operator.Equal:
				if (!this.isNumberWithOutDot(this.lastInput) && !this.isOneOperator(this.lastInput)){
					this.evalExpress = this.evalExpress.slice(0, -1);
				} else if (!this.isOneOperator(this.lastInput)) {
					this.evalExpress = this.evalExpress + this.value;
				}

				this.value = this.evaluate(this.evalExpress);
				this.evalExpress = "";
				break;	
		}
	}

	isNumber(value: string) {
		if (value.endsWith('0') || 
			value.endsWith('1') || 
			value.endsWith('2') || 
			value.endsWith('3') || 
			value.endsWith('4') || 
			value.endsWith('5') || 
			value.endsWith('6') || 
			value.endsWith('7') || 
			value.endsWith('8') || 
			value.endsWith('9') ||
			value.endsWith('.'))
			return true;
		else 
			return false;
	}

	isNumberWithOutDot(value: string) {
		if (value.endsWith('0') || 
		value.endsWith('1') || 
		value.endsWith('2') || 
		value.endsWith('3') || 
		value.endsWith('4') || 
		value.endsWith('5') || 
		value.endsWith('6') || 
		value.endsWith('7') || 
		value.endsWith('8') || 
		value.endsWith('9') )
		return true;
	else 
		return false;
	}

	isDotlast(value: string) {
		return value.endsWith('.');
	}

	isOneOperator(value: string) {
		return value == Operator.Percent || value == Operator.Square || value == Operator.SquareRoot || value == Operator.XDivider;
	}

	canInputLeftParenthesis(value: string) {
		let rightCount = 0;
		let leftCount = 0;
		for (let i = 0; i< value.length; i++) {
			if (value[i] == Operator.RightParenthesis) rightCount++;
			else if (value[i] == Operator.LeftParenthsis) leftCount++;
		}

		return rightCount > leftCount  && this.isNumber(value);
	}

	canInputRightParenthesis(value: string) {
	
	}

	hasDot(value: string) {
		return value.indexOf(Operator.Dot) > -1;
	}

	evaluate(exp: string) {
		try {
			return math.eval(exp).toString(); // no exception occured
		} catch (e) {
			if (e instanceof SyntaxError) { // Syntax error exception
				return 'E'; // exception occured
			}
			else {// Unspecified exceptions
				return 'E'; // exception occured
			}
		}
	}
}