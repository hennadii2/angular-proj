import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
	selector: 'app-tab',
	templateUrl: './tab.component.html',
	styleUrls: ['./tab.component.scss']
})
export class TabComponent {
	_title: string;

	@Input('tabTitle')
	get title() {
		return this._title;
	};
	set title(value) {
		this._title = value;
	}
	@Input() active = false;
	@Input() template;
	@Input() data;
	@Input() url;

	constructor(public element: ElementRef) { }

}
