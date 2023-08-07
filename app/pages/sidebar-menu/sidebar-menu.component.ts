import { Component, ViewChild, OnInit, OnDestroy, Injector, Input, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { TabService } from 'src/app/tab/tab.service';
import { Tab } from 'src/app/tab/tab';
import { PagesMenu } from '../pages-menu.model';
import { takeWhile, filter } from 'rxjs/operators';

import { ABO_ICONS } from 'src/app/shared/constants/abo-icons';
import { TABS } from 'src/app/shared/constants/tab';
import { NbSidebarService } from '@nebular/theme';
import { PageType, ButtonType, PageSize } from 'src/app/shared/models/data-driven.model';
import { Menu } from 'src/app/shared/models/menu.model';
import { DataDrivenModalFormSetComponent } from 'src/app/shared/components/data-driven/modal/formset/formset.component';
import { ModalDeviceInfoComponent } from 'src/app/shared/modals/device-info/device-info.component';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { ModalPackingComponent } from '../modals/packing/packing.component';
import { ModalPickingComponent } from '../modals/picking/picking.component';
import { ModalPivotTableComponent } from 'src/app/shared/modals/pivot-table/pivot-table.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
    selector   : 'app-sidebar-menu',
    templateUrl: './sidebar-menu.component.html',
    styleUrls  : ['./sidebar-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SidebarMenuComponent implements OnInit, OnDestroy{
    TABS = TABS;
    ABO_ICONS = ABO_ICONS;
    PageType = PageType;

    @Input() menus: Menu[]=[];
    selectedMenu: Menu;
    selectedTabUrl: string;
    alive = true;
    constructor(
        private tabService: TabService,
        private sidebarService: NbSidebarService,
        private deviceService: DeviceDetectorService,
        private modalService: NgbModal
    ) {
        this.tabService.tab$.pipe(
            takeWhile(()=> this.alive)
        ).subscribe(tab=>{
        });

        this.tabService.tabClosed.pipe(
            takeWhile(()=> this.alive)
        ).subscribe(tab=>{
        });

        this.tabService.tabActived.pipe(
            takeWhile(()=> this.alive)
        ).subscribe(tab=>{
            if (tab && tab.url) {
                this.selectedMenu = this.findMenu(this.menus, tab.url);
                this.selectedTabUrl = tab.url;
            } else {
                this.selectedMenu = null;
                this.selectedTabUrl = null;
            }
        });
    }


    ngOnInit() {
    }

    ngOnDestroy() {
        this.alive = false;
    }

    clickMenu(menu: Menu) {
        menu.actived = !menu.actived;
        this.selectedMenu = menu;
        //let tab = item.tab;
        //tab.url =tab.url + "/" + Math.random() * 100;
        if (menu.submenu) this.sidebarService.expand('menu-sidebar');
        else if (document.body.clientWidth < 1200) {
            this.sidebarService.expand('menu-sidebar');
            this.sidebarService.toggle(true, 'menu-sidebar');
        }

        let currentTime = new Date().getTime();
        let data: any = {id: `${menu.id}${currentTime}`, title: menu.title, pagetype: menu.pagetype, hidefilter: menu.hidefilter, itemid: menu.itemid};
        let tab;

        switch (menu.pagetype) {
            case PageType.Form:
                data['onclick'] = { endpoint: menu.endpoint, buttons: menu.buttons };
                
                tab = new Tab( `${menu.title}`, `formsetTpl`, `${menu.id}${currentTime}`, data);
                this.tabService.openTab(tab);
                break;

            case PageType.TabForm:
                data['endpoint'] = menu.endpoint;
                data['onclick'] = { endpoint: `${menu.endpoint}/form`, buttons: menu.buttons };
                data['isDashboardElement'] = false;
                
                tab = new Tab( `${menu.title}`, `formsetTpl`, `${menu.id}${currentTime}`, data);
                this.tabService.openTab(tab);
                break;

            case PageType.Grid:
            case PageType.TabGrid:
            case PageType.TreeGrid:
                data['endpoint'] = menu.endpoint;
                data['buttons'] = menu.buttons;
                data['onclick'] = menu.onclick;
                data['position'] = menu.position;
                data['rowrefresh'] = menu.rowrefresh;
                data['fieldheight'] = menu.fieldheight;
                data['draggable'] = menu.draggable;
                data['hidefilterrow'] = menu.hidefilterrow;
                data['groupable'] = menu.groupable;

                tab = new Tab( `${menu.title}`, `formsetTpl`, `${menu.id}${currentTime}`, data);
                this.tabService.openTab(tab);
                break;

            case PageType.Chart:
                data['chart_onclick'] ={ endpoint: menu.endpoint, buttons: menu.buttons };

                tab = new Tab( `${menu.title}`, `formsetTpl`, `${menu.id}${currentTime}`, data);
                this.tabService.openTab(tab);
                break;

            case PageType.Kanban:
            case PageType.Scheduler:
                data['endpoint'] = menu.endpoint;
                data['buttons'] = menu.buttons;
                data['onclick'] = menu.onclick;
                data['typeview'] = menu.typeview;
            case PageType.Timeline:
                data['endpoint'] = menu.endpoint;
                data['buttons'] = menu.buttons;
                data['onclick'] = menu.onclick;
                data['typeview'] = menu.typeview;


                tab = new Tab( `${menu.title}`, `formsetTpl`, `${menu.id}${currentTime}`, data);
                this.tabService.openTab(tab);
                break;
            case PageType.Pivot:
              const pivotTableTemplateData = {
                "dataSourceEndpoint": menu.endpoint,
                "sliceEndpoint": menu.report,
                "hideToolbar": menu.hidetoolbar
              }
              
              tab = new Tab( `${menu.title}`, `pivotTableTpl`, `${menu.itemid}${currentTime}`, pivotTableTemplateData);
              this.tabService.openTab(tab);
              
              break
            case PageType.ModalPivot:
              this.openModalPivotTable(menu)
              
              break
            case PageType.DeviceInfo:
                data = {};
                tab = new Tab( `${menu.title}`, `deviceinfoTpl`, `${menu.id}${currentTime}`, data);
                break;

            case PageType.Inventory:
                data = {};
                tab = new Tab( `${menu.title}`, `inventoryTpl`, `${menu.id}${currentTime}`, data);
                break;

            case PageType.Packing:
            case PageType.Picking:
            case PageType.ModalForm:
            case PageType.ModalGrid:
            case PageType.ModalTabGrid:
            case PageType.ModalTreeGrid:
            case PageType.ModalTabForm:
            case PageType.ModalChart:
            case PageType.ModalKanban:
            case PageType.ModalDeviceInfo:
            case PageType.ModalScheduler:
            case PageType.ModalTimeline:
                this.openModalFormSet(menu);
                break;

        }

    }
    
    openModalPivotTable (menu: Menu) {
      const modalConfiguration: any = {
        centered: true,
        draggableSelector: '.modal-header'
      }
      
      if (menu.pagesize && menu.pagesize != PageSize.Medium)
        modalConfiguration['size'] = menu.pagesize
      
      const pivotTableModal = this.modalService.open(ModalPivotTableComponent, modalConfiguration)
      
      pivotTableModal.componentInstance.title = menu.title
      pivotTableModal.componentInstance.pagetype = menu.pagetype
      pivotTableModal.componentInstance.buttons = menu.buttons
      pivotTableModal.componentInstance.dataSourceEndpoint = menu.endpoint
      pivotTableModal.componentInstance.sliceEndpoint = menu.report
      pivotTableModal.componentInstance.hideToolbar = menu.hidetoolbar
      
      pivotTableModal.result.then(result => {
        console.log('Modal launched')
      })
    }
    
    openModalFormSet(menu: Menu) {
        
        let modal_param: any = {centered: true, draggableSelector: '.modal-header' };
        if (menu.pagesize && menu.pagesize != PageSize.Medium) modal_param['size'] = menu.pagesize;
                
        if (menu.pagetype == PageType.ModalDeviceInfo) {
            const deviceModalRef = this.modalService.open(ModalDeviceInfoComponent, modal_param);
            deviceModalRef.componentInstance.title = menu.title;
            deviceModalRef.componentInstance.pagetype = menu.pagetype;
            deviceModalRef.componentInstance.buttons = menu.buttons;

            deviceModalRef.result.then(result=>{
                if (result) {
      
                }
            });

            return;
        } else if (menu.pagetype == PageType.Packing) {
            modal_param = {centered: true, windowClass: "packing-modal"};
  
            const packingModalRef = this.modalService.open(ModalPackingComponent, modal_param);
            packingModalRef.componentInstance.title = menu.title;
            packingModalRef.componentInstance.endpoint = menu.endpoint;
            packingModalRef.componentInstance.onclick = menu.onclick;
            packingModalRef.result.then(result=>{
                if (result) {

                }
            });

            return;
        } else if (menu.pagetype == PageType.Picking) {
            modal_param = {centered: true, windowClass: "packing-modal"};
            const pickingModalRef = this.modalService.open(ModalPickingComponent, modal_param);
            pickingModalRef.componentInstance.title = menu.title;
            pickingModalRef.componentInstance.endpoint = menu.endpoint;
            pickingModalRef.componentInstance.onclick = menu.onclick;
            pickingModalRef.result.then(result=>{
                if (result) {

                }
            });

            return;
        }
        
        const modalRef = this.modalService.open(DataDrivenModalFormSetComponent, modal_param);
   
        modalRef.componentInstance.maintype = menu.pagetype;
        modalRef.componentInstance.pagetype = menu.pagetype;
        modalRef.componentInstance.itemid = menu.itemid;
        modalRef.componentInstance.hidefilter = menu.hidefilter;
        modalRef.componentInstance.title = menu.title;

        if (menu.pagetype == PageType.ModalForm) {
            modalRef.componentInstance.onclick = { endpoint: menu.endpoint, buttons: menu.buttons };
        } else if( menu.pagetype == PageType.ModalTabForm ) {
            modalRef.componentInstance.endpoint = menu.endpoint;
            modalRef.componentInstance.onclick = { endpoint: `${menu.endpoint}/form`, buttons: menu.buttons };
        } else if (menu.pagetype == PageType.ModalChart) {
            modalRef.componentInstance.chart_onclick = { endpoint: menu.endpoint, buttons: menu.buttons };
        } else {
            modalRef.componentInstance.endpoint = menu.endpoint;
            modalRef.componentInstance.buttons = menu.buttons;
            modalRef.componentInstance.onclick = menu.onclick;
            modalRef.componentInstance.position = menu.position;
            modalRef.componentInstance.rowrefresh = menu.rowrefresh;
            modalRef.componentInstance.fieldheight = menu.fieldheight;
            modalRef.componentInstance.draggable = menu.draggable;
            modalRef.componentInstance.groupable = menu.groupable;
            modalRef.componentInstance.hidefilterrow = menu.hidefilterrow;
            modalRef.componentInstance.typeview = menu.typeview;
        }


		modalRef.result.then(result=>{
            this.selectedMenu = this.findMenu(this.menus, this.selectedTabUrl);
			if (result) {
  
			}
		});
    }

    getMainMenu(menus: Menu[], menu: Menu) {
        if (!menus || !menu) return null;
        let mainMenu: Menu = menus.find(m => m == menu);
        if (mainMenu) {
            return mainMenu;    
        } else {
            let filterMenus: Menu[] = menus.filter(m=> !!m.submenu && m.submenu.length > 0);

            if (filterMenus.length > 0) {
                for (let i=0; i<filterMenus.length; i++) {
                    let subMenu = this.getMainMenu(filterMenus[i].submenu, menu);
                    if (!!subMenu) return filterMenus[i];
                }
            }
        }

        return null;
    }

    findMenu(menus: Menu[], menuId: string) {
        if (!menus || !menuId) return null;
        let mainMenu: Menu = menus.find(m => menuId.indexOf(m.id) == 0);
        if (mainMenu) {
            return mainMenu;
        } else {
            let filterMenus: Menu[] = menus.filter(m=> !!m.submenu && m.submenu.length > 0);

            if (filterMenus.length > 0) {
                for (let i=0; i<filterMenus.length; i++) {
                    let subMenu = this.findMenu(filterMenus[i].submenu, menuId);
                    if (!!subMenu) return subMenu;
                }
            }
        }

        return null;        
    }

}

