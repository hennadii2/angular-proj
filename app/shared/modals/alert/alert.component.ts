import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { TokenStorage } from '../../authentication/token-storage.service';
import { NgbActiveModal } from '../../ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-modal-alert',
  templateUrl: './alert.component.html',
	styleUrls: ['./alert.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalAlertComponent implements OnInit {

  @Input() title: string ="MODAL.CONFIRM";
  @Input() message: string = "MODAL.CONFIRM_MESSAGE";
  btn_yes: string = "YES";
  btn_no: string = "NO";
  button_corner: number = 0;
  constructor(
    private tokenStorage: TokenStorage,
    public domSanitizer: DomSanitizer,
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
