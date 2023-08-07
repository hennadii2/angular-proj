import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core'

import { TokenStorage } from '../../authentication/token-storage.service'
import { ButtonType } from '../../models/data-driven.model'
import { NgbActiveModal } from '../../ng-bootstrap'

import { ABO_ICONS } from '../../constants/abo-icons'

@Component({
  selector: 'app-modal-pivot-table',
  templateUrl: './pivot-table.component.html',
	styleUrls: ['./pivot-table.component.scss']
})
export class ModalPivotTableComponent implements OnInit {
  ABO_ICONS = ABO_ICONS
  ButtonType = ButtonType
  title: string
  buttons: ButtonType[]
  button_corner: number
  dataSourceEndpoint: string
  sliceEndpoint: string
  hideToolbar: boolean = false
  
  constructor(
    private tokenStorage: TokenStorage,
    public activeModal: NgbActiveModal) {
      this.button_corner = this.tokenStorage.getButtonCornder()
  }

  ngOnInit() {

  }
  
  closeModal() {
    this.activeModal.close()
  }
}
