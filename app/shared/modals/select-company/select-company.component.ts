import { Component, OnInit, ViewEncapsulation, Input, SimpleChanges } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Postnr } from '../../models/postnr.model';
import { Company } from '../../models/company.model';
import { TokenStorage } from '../../authentication/token-storage.service';
import { NgbActiveModal } from '../../ng-bootstrap';


@Component({
  selector: 'app-modal-select-company',
  templateUrl: './select-company.component.html',
	styleUrls: ['./select-company.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalSelectCompanyComponent implements OnInit {

  search_key: string = '';
  @Input() postnrs: Postnr[]=[];

  companies: Company[];
  company: string;
	button_corner: number;

  constructor(
		private tokenStorage: TokenStorage,
    public activeModal: NgbActiveModal,
    private toastrService: NbToastrService) {
      this.button_corner = this.tokenStorage.getButtonCornder();
  }

  ngOnInit() {
    this.company = this.companies[0].dossier;
  }

	ngOnChanges(changes: SimpleChanges) {
		if (changes['companies'] ) {
      this.company = this.companies[0].dossier;
		}
  }
  


  select() {
    this.activeModal.close(this.company);
  }
  
  closeModal() {
    this.activeModal.close();
  }
}
