import { Component, Input, OnInit } from '@angular/core';

import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AnalyticsService } from '../../../@core/utils/analytics.service';
import { filter, map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/authentication/authentication.service';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { Menu } from 'src/app/shared/models/menu.model';


@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  selectedLang: any;
  @Input() position = 'normal';
  
  user: any;

  topMenus: Menu[]=[];
  infopages_url: string;

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private analyticsService: AnalyticsService,
              public tokenStorage: TokenStorage,
              private authService: AuthenticationService) {
      this.topMenus = this.tokenStorage.getUserTopMenu();
      this.infopages_url = this.tokenStorage.getInfoPagesUrl();
  }

  ngOnInit() {

    this.user = { name: 'Nick Jones', picture: 'assets/images/nick.png' };

    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-context-menu'),
      )
      .subscribe(item => {
        if (item.item['id']=="logout") {
          this.logout();
        }
      });
  }
  logout() {
    this.authService.logout();
  }
  
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');

    return false;
  }

  toggleSettings(): boolean {
    this.sidebarService.toggle(false, 'settings-sidebar');

    return false;
  }

  gotoInfoPages() {
    window.open(this.infopages_url, "_blank");
  }

  goToHome() {
    this.menuService.navigateHome();
  }

  startSearch() {
    this.analyticsService.trackEvent('startSearch');
  }
}
