import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { TokenStorage } from '../../authentication/token-storage.service';
import { ButtonType } from '../../models/data-driven.model';
import { ABO_ICONS } from '../../constants/abo-icons';
import { NgbActiveModal } from '../../ng-bootstrap';


@Component({
  selector: 'app-modal-calculator',
  templateUrl: './calculator.component.html',
	styleUrls: ['./calculator.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalCalculatorComponent implements OnInit {
  ABO_ICONS = ABO_ICONS;
  ButtonType = ButtonType;
  title: string;
  buttons: ButtonType[];
  button_corner: number;

  value: any;
  constructor(
    private tokenStorage: TokenStorage,
    public activeModal: NgbActiveModal) {
      this.button_corner = this.tokenStorage.getButtonCornder();
  }

  ngOnInit() {

  }
  
  closeModal() {
    this.activeModal.close();
  }

  onOk(value: any) {
    this.activeModal.close(value);
  }
}
