import { Component, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class InventoryComponent implements OnInit {
	@Output() onExit = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }
  
	exit() {
		this.onExit.next();
	}

}