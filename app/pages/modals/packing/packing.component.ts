import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';

@Component({
  selector: 'app-modal-packing',
  templateUrl: './packing.component.html',
	styleUrls: ['./packing.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalPackingComponent implements OnInit {

  title: string;
  endpoint: string;
  onclick: any;
  constructor(
    public activeModal: NgbActiveModal) {
  }

  ngOnInit() {

  }

  yes() {
  }
  
  closeModal() {
    this.activeModal.close();
  }
}
