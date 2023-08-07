import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { TokenStorage } from '../../authentication/token-storage.service';
import { NgbActiveModal } from '../../ng-bootstrap';


@Component({
  selector: 'app-modal-confirm',
  templateUrl: './confirm.component.html',
	styleUrls: ['./confirm.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalConfirmComponent implements OnInit {

  title: string ="MODAL.CONFIRM";
  message: string = "MODAL.CONFIRM_MESSAGE";
  btn_yes: string = "YES";
  btn_no: string = "NO";
  button_corner: number;
  constructor(
    private tokenStorage: TokenStorage,
    public activeModal: NgbActiveModal) {
      this.button_corner = this.tokenStorage.getButtonCornder();
  }

  ngOnInit() {

  }

  yes() {
		this.activeModal.close(true);
  }
  
  closeModal() {
    this.activeModal.close();
  }
}
