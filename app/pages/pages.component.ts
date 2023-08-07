import { Component } from '@angular/core';
import { NbMenuService, NbMediaBreakpoint } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { TabService } from '../tab/tab.service';
import { Subscription } from 'rxjs';
import { Tab } from '../tab/tab';
import { Menu } from '../shared/models/menu.model';
import { TokenStorage } from '../shared/authentication/token-storage.service';

@Component({
  selector: 'ngx-pages',
  templateUrl: './pages.component.html',
  styleUrls  : ['./pages.component.scss']
})
export class PagesComponent {
  private alive = true;
  menus: Menu[];
  constructor(
    protected menuService: NbMenuService,
    private tabService: TabService,
    private tokenStorage: TokenStorage){
      this.menuService.onItemSelect()
      .pipe(
        takeWhile(() => this.alive)
      ).subscribe(item => {
        let node = item.item;
        this.openTab(node['tab']);
      });

      this.menus = this.tokenStorage.getUserMenu();  }

  ngAfterViewInit() {
    this.showMainSpinner(false);
  }

  ngOnDestroy() {
    this.alive = false;
  }

  openTab(tab: Tab) {
    this.tabService.openTab(tab);
  }

  

  showMainSpinner(isShow: boolean) {
    let spinnerEl = document.getElementsByClassName("lds-css")[0];

    if (spinnerEl.classList.contains("d-none")) {
       if (isShow) spinnerEl.classList.remove("d-none")
    } else  {
       if (!isShow) spinnerEl.classList.add("d-none");
    }
}
}
