import { Component, ViewChild, OnInit, OnDestroy, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { NbToastrService } from '@nebular/theme';
import { DataDrivenService } from 'src/app/shared/services/data-driven.service';

import { Tab } from '../../tab/tab';
import { TabService } from '../../tab/tab.service';
import { TabsComponent } from '../../tab/tabs/tabs.component';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { Company } from 'src/app/shared/models/company.model';
import { ModalSelectCompanyComponent } from 'src/app/shared/modals/select-company/select-company.component';
import { CompanyService } from 'src/app/shared/services/company.service';
import { PageType, ButtonType } from 'src/app/shared/models/data-driven.model';
import { NgbModalConfig, NgbModal } from 'src/app/shared/ng-bootstrap';
import { LanguageService } from 'src/app/shared/services/language.service';
import { WebDataRocksPivot } from "../../webdatarocks/webdatarocks.angular4";

@Component({
  selector : 'app-home',
  templateUrl : './home.component.html',
  styleUrls : ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  tabSubscription: Subscription
  closeTabSubscription: Subscription
  PageType: PageType
  
  @ViewChild(TabsComponent) tabsComponent

  @ViewChild('pivotTableTpl') pivotTableTpl
  @ViewChild('reportGenerateTpl') reportGenerateTpl
  @ViewChild('formsetTpl') formsetTpl
  @ViewChild('tabWindowTpl') tabWindowTpl
  @ViewChild('modalFormsetTpl') modalFormsetTpl
  @ViewChild('deviceinfoTpl') deviceinfoTpl
  @ViewChild('inventoryTpl') inventoryTpl
  @ViewChild('packingTpl') packingTpl
  @ViewChild('pivot') pivotWdiget: WebDataRocksPivot
  
  alive: boolean = false
  dashboardData: any
  
  constructor (
    config: NgbModalConfig,
    private tabService: TabService,
    private tokenStorage: TokenStorage,
    private modalService: NgbModal,
    private companyService: CompanyService,
    private toastrService: NbToastrService,
    private injector: Injector,
    private langService: LanguageService,
    private dataDrivenService: DataDrivenService) {
    // Component init
    setTimeout(() => {
      config.backdrop = 'static';
      config.keyboard = false;
    }, 0)
    
    this.langService.setLang(this.langService.getLang())
    
    this.tabSubscription = this.tabService.tab$.subscribe(tab => { this.openTab(tab) })

    this.closeTabSubscription = this.tabService.tabClosed.subscribe(url => { this.closeTab(url) })
  }

  ngOnInit () {
    this.alive = true
    this.selectCompany()
    this.getDashboardData()
  }

  ngAfterViewInit () {
  }

  ngOnDestroy () {
    this.alive = false
    
    this.tabSubscription.unsubscribe()
    this.closeTabSubscription.unsubscribe()
  }
  
  getDashboardData () {
    this.dashboardData = this.tokenStorage.getDashboardData();
    // this.dashboardData.widgets[0].itemid = 'EON'
    // this.dashboardData.widgets[0].buttons = ['add', 'exit']
  }
  
  setCompany (company) {
    this.companyService
          .setCompany(company)
          .subscribe(
            res => {
              let company = res.company
              this.tokenStorage.setUserCompany(company)
            },
            err => {
              this.toastrService.danger(err.message, 'Error')
            })
  }

  openTab (tab: Tab) {
    const _tab = {
      ...tab,
      template: this[tab.template]
    }

    this.tabsComponent.openTab(_tab)
  }

  closeTab (url: string) {
    if (!url) {
      return false
    }
    
    this.tabsComponent.closeTabByURL(url)
  }

  selectCompany () {
    let selectedCompany = this.tokenStorage.getUserCompany()
    let companies: Company[] = this.tokenStorage.getUserCompanies()
    
    if (selectedCompany || companies.length <= 1) {
      return
    }
    
    setTimeout(() => {
      const modalRef = this.modalService
                           .open(ModalSelectCompanyComponent, {
                             size: 'sm',
                             centered: true,
                             draggableSelector: '.modal-header' 
                            })

      modalRef.componentInstance.companies = companies

      modalRef.result.then(result => {
        if (result) {
          this.setCompany(result)
        }
      })
    }, 0)
  }

  clickButtonBar (button: ButtonType, tabId: any) {
  	switch (button) {
  		case ButtonType.Add:
  		case ButtonType.Save:
  		case ButtonType.Edit:
      case ButtonType.Next:
  		case ButtonType.View:
  		case ButtonType.List:
  		case ButtonType.Previous:
      case ButtonType.Delete:
  			break
  		case ButtonType.Exit:
  			this.closeTab(tabId)
  			break
  	}
  }
}
