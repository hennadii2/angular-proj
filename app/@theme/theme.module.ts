import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select'
import {
  NbActionsModule,
  NbCardModule,
  NbLayoutModule,
  NbMenuModule,
  NbRouteTabsetModule,
  NbSearchModule,
  NbSidebarModule,
  NbTabsetModule,
  NbThemeModule,
  NbUserModule,
  NbCheckboxModule,
  NbPopoverModule,
  NbContextMenuModule,
  NbProgressBarModule,
  NbToastrModule,
  NbSelectModule,
  NbSpinnerModule,
  NbDatepickerModule
} from '@nebular/theme';
import { NbSecurityModule } from '@nebular/security';

import {
  FooterComponent,
  HeaderComponent,
  SearchInputComponent
} from './components';

import {
  DeafultLayoutComponent
} from './layouts';
import { DEFAULT_THEME } from './styles/theme.default';
import { COSMIC_THEME } from './styles/theme.cosmic';
import { CORPORATE_THEME } from './styles/theme.corporate';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderTopMenuComponent } from './components/header/top-menu/top-menu.component';
import { JqxModule } from '../shared/jqx.module';
import { NgbModule } from '../shared/ng-bootstrap';
import { PipesModule } from './pipes/pipes.module';

const BASE_MODULES = [CommonModule, FormsModule, ReactiveFormsModule];

const NB_MODULES = [
  NbCardModule,
  NbLayoutModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbSidebarModule,
  NbCheckboxModule,
  NbPopoverModule,
  NbContextMenuModule,
  NbSelectModule,
  NgbModule,
  NbSecurityModule, // *nbIsGranted directive,
  NbProgressBarModule,
  NbToastrModule,
  NbSelectModule,
  NbSpinnerModule,
  NbDatepickerModule
];

const COMPONENTS = [
  HeaderComponent,
  HeaderTopMenuComponent,
  FooterComponent,
  SearchInputComponent,
  DeafultLayoutComponent
];

const ENTRY_COMPONENTS = [
];

const NB_THEME_PROVIDERS = [
  ...NbThemeModule.forRoot(
    {
      name: 'corporate', //'default', 'cosmic'
    },
    [ DEFAULT_THEME, COSMIC_THEME, CORPORATE_THEME ],
  ).providers,
  ...NbSidebarModule.forRoot().providers,
  ...NbMenuModule.forRoot().providers,
  ...NbToastrModule.forRoot().providers,
  ...NbDatepickerModule.forRoot().providers
];

@NgModule({
  imports: [...BASE_MODULES, ...NB_MODULES, NgSelectModule, TranslateModule, JqxModule, PipesModule],
  exports: [...BASE_MODULES, ...NB_MODULES, ...COMPONENTS, PipesModule],
  declarations: [...COMPONENTS],
  entryComponents: [...ENTRY_COMPONENTS],
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: ThemeModule,
      providers: [...NB_THEME_PROVIDERS],
    };
  }
}
