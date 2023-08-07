import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from 'src/app/shared/ng-bootstrap';

@Component({
  selector: 'app-modal-picking',
  templateUrl: './picking.component.html',
	styleUrls: ['./picking.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalPickingComponent implements OnInit {

  title: string;
  endpoint: string;
  onclick: string;

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
