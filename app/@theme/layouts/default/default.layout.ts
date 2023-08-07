import { Component, OnDestroy } from '@angular/core';
import { delay, withLatestFrom, takeWhile } from 'rxjs/operators';
import {
  NbMediaBreakpoint,
  NbMediaBreakpointsService,
  NbMenuItem,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from '@nebular/theme';


// TODO: move layouts into the framework

@Component({
  selector: 'ngx-default-layout',
  styleUrls: ['./default.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header [position]="'normal'"></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar"
                   tag="menu-sidebar"
                   responsive>

        <ng-content select="app-sidebar-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column class="main-content p-2">
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <ngx-footer></ngx-footer>
      </nb-layout-footer>

    </nb-layout>
  `,
})
export class DeafultLayoutComponent implements OnDestroy {

  layout: any = {};
  sidebar: any = {};

  private alive = true;

  currentTheme: string;

  constructor(
              protected menuService: NbMenuService,
              protected themeService: NbThemeService,
              protected bpService: NbMediaBreakpointsService,
              protected sidebarService: NbSidebarService) {


    const isBp = this.bpService.getByName('is');
    this.menuService.onItemSelect()
      .pipe(
        takeWhile(() => this.alive),
        withLatestFrom(this.themeService.onMediaQueryChange())
      )
      .subscribe(([item, [bpFrom, bpTo]]: [any, [NbMediaBreakpoint, NbMediaBreakpoint]]) => {
        if (bpTo.width <= isBp.width) {
          this.sidebarService.collapse('menu-sidebar');
        }
      });

    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
