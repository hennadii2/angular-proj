import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tab/tab.component';
import { DynamicTabsDirective } from './dynamic-tabs.directive';
import { TabInkBar } from './tabs/ink-bar';

import { TabService } from './tab.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
	imports: [
		CommonModule,
		SharedModule
	],
	declarations: [
		TabsComponent,
		TabComponent,
		DynamicTabsDirective,
		TabInkBar
	],
	entryComponents: [
		TabComponent
	],
	exports: [
		TabsComponent,
		TabComponent,
		DynamicTabsDirective
	],
	providers: [
		TabService
	]
})
export class TabModule { }
