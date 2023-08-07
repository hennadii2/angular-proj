import { Component, OnInit, SimpleChanges, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';

@Component({
	selector: 'app-web-page',
	templateUrl: './web-page.component.html',
	styleUrls: ['./web-page.component.scss'],	
})
export class WebPageComponent implements OnInit {
	@Input() data: any;

	@Output() onExit = new EventEmitter();

	constructor () {}

	ngOnInit() {
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
	}

	exit() {
		this.onExit.next();
	}
}
