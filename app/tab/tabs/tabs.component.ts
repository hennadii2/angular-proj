import { 
	Component,
	ContentChildren,
	QueryList,
	ViewChild,
	ComponentFactoryResolver,
	ViewContainerRef,
	ViewEncapsulation,
	ElementRef,
	AfterContentInit,
	AfterContentChecked,
	AfterViewChecked,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from '@angular/core';

import { TabComponent } from '../tab/tab.component';
import { DynamicTabsDirective } from '../dynamic-tabs.directive';
import { Tab } from '../tab';
import { TabInkBar } from './ink-bar';
import { TabService } from '../tab.service';

export type ScrollDirection = 'after' | 'before';
const EXAGGERATED_OVERSCROLL = 60;

@Component({
	selector: 'app-tabs',
	templateUrl: './tabs.component.html',
	styleUrls: ['./tabs.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class TabsComponent implements AfterContentInit {
	dynamicTabs: TabComponent[] = [];

	@ContentChildren(TabComponent)
	tabs: QueryList<TabComponent>;

	@ViewChild(DynamicTabsDirective)
	dynamicTabPlaceholder: DynamicTabsDirective;

	@ViewChild('tabListContainer') _tabListContainer: ElementRef;
	@ViewChild('tabList') _tabList: ElementRef;
	@ViewChild(TabInkBar) _inkBar: TabInkBar;

	/** The distance in pixels that the tab labels should be translated to the left. */
	private _scrollDistance = 0;

	private _selectedTab = null;

	/** Whether the tab list can be scrolled more towards the end of the tab label list. */
	_disableScrollAfter = true;

	/** Whether the tab list can be scrolled more towards the beginning of the tab label list. */
	_disableScrollBefore = true;

	_showPaginationControls = false;
	
	constructor(
		private _componentFactoryResolver: ComponentFactoryResolver, 
		private tabService: TabService, 
		private element: ElementRef) {
	}

	ngAfterContentInit() {
		// get all active tabs
		let activeTabs = this.tabs.filter((tab) => tab.active);

		// if there is no active tab set, activate the first
		if (activeTabs.length === 0) {
			this.selectTab(this.tabs.first);
		}
	}

	openTab(newTab: Tab) {
		const existedTab = this.dynamicTabs.find(tab => tab.url == newTab.url);
		if (false && existedTab && !newTab.shouldAlwaysOpen) {
			this.selectTab(existedTab);
		} else {
			// get a component factory for our TabComponent
			let componentFactory = this._componentFactoryResolver.resolveComponentFactory(TabComponent);

			// fetch the view container reference from our anchor directive
			let viewContainerRef = this.dynamicTabPlaceholder.viewContainer;

			// create a component instance
			let componentRef = viewContainerRef.createComponent(componentFactory);

			// set the according properties on our component instance
			let instance: TabComponent = componentRef.instance as TabComponent;
			instance.title = newTab.title;
			instance.url = newTab.url;
			instance.template = newTab.template;
			instance.data = newTab.data;

			// remember the dynamic component for rendering the
			// tab navigation headers
			this.dynamicTabs.push(componentRef.instance as TabComponent);

			// set it active
			setTimeout(() => { 
				this.selectTab(this.dynamicTabs[this.dynamicTabs.length - 1]);
			});
		}
	}

	selectTab(tab: TabComponent) {
		setTimeout(() => {
			// deactivate all tabs
			this.tabs.toArray().forEach(tab => tab.active = false);
			this.dynamicTabs.forEach(tab => tab.active = false);
	
			// activate the tab the user has clicked on.
			tab.active = true;
	
			let selectedTabIndex = this.tabs.toArray().findIndex(t => t == tab);
			if (selectedTabIndex < 0) {
				selectedTabIndex = this.tabs.toArray().length + this.dynamicTabs.findIndex(t => t == tab);
			}
			this._selectedTab = this._tabList.nativeElement.children[selectedTabIndex];
			if (this._selectedTab) this._scrollToLabel(this._selectedTab);

			this.tabService.tabActived.next(tab);
			this.tabService.currentTab = tab;
		});

		setTimeout(() => {
			this._checkPaginationEnabled();
		}, 100);
	}

	/**
	 * Evaluate whether the pagination controls should be displayed. If the scroll width of the
	 * tab list is wider than the size of the header container, then the pagination controls should
	 * be shown.
	 *
	 * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
	 * should be called sparingly.
	 */
	_checkPaginationEnabled() {
		const isEnabled = this._tabList.nativeElement.scrollWidth > this._tabListContainer.nativeElement.offsetWidth;

		if (!isEnabled) {
			this.scrollDistance = 0;
		}

		this._showPaginationControls = isEnabled;
	}
	
	/**
   * Moves the tab list such that the desired tab label (marked by index) is moved into view.
   *
   * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
   * should be called sparingly.
   */
	_scrollToLabel(tabElement) {
		const viewLength = this._tabListContainer.nativeElement.offsetWidth;
		const elementWidth = tabElement.offsetWidth;
		
		let labelBeforePos: number, labelAfterPos: number;

		labelBeforePos = tabElement.offsetLeft;
		labelAfterPos = labelBeforePos + elementWidth;

		const beforeVisiblePos = this.scrollDistance;
		const afterVisiblePos = this.scrollDistance + viewLength;
		
		if (labelBeforePos < beforeVisiblePos) {
			// Scroll header to move label to the before direction
			this.scrollDistance -= beforeVisiblePos - labelBeforePos + EXAGGERATED_OVERSCROLL;
		} else if (labelAfterPos > afterVisiblePos) {
			// Scroll header to move label to the after direction
			this.scrollDistance += labelAfterPos - afterVisiblePos + EXAGGERATED_OVERSCROLL;
		} else {
			if (!this._showPaginationControls) this.scrollDistance = 0;
		}
		this._updateTabScrollPosition();
		this._alignInkBarToSelectedTab();		
	}

	closeTab(tab: TabComponent) {
		for (let i = 0; i < this.dynamicTabs.length; i++) {
			if (this.dynamicTabs[i] === tab) {
				// remove the tab from our array
				this.dynamicTabs.splice(i, 1);
				
				// destroy our dynamically created component again
				let viewContainerRef = this.dynamicTabPlaceholder.viewContainer;
				// let viewContainerRef = this.dynamicTabPlaceholder;
				viewContainerRef.remove(i);

				// set tab index to 1st one
				if (i > 0) {
					this.selectTab(this.dynamicTabs[i - 1]);
				} else {
					this.selectTab(this.tabs.last);
				}
				break;
			}
		}
	}

	closeTabByURL(url: string) {
		for (let i = 0; i < this.dynamicTabs.length; i++) {
			if (this.dynamicTabs[i].url === url) {
				// remove the tab from our array
				this.dynamicTabs.splice(i, 1);

				// destroy our dynamically created component again
				let viewContainerRef = this.dynamicTabPlaceholder.viewContainer;
				// let viewContainerRef = this.dynamicTabPlaceholder;
				viewContainerRef.remove(i);

				// set tab index to 1st one
				if (i > 0) {
					this.selectTab(this.dynamicTabs[i - 1]);
				} else {
					this.selectTab(this.tabs.last);
				}
				break;
			}
		}
	}

	closeActiveTab() {
		let activeTabs = this.dynamicTabs.filter((tab) => tab.active);
		if (activeTabs.length > 0) {
			// close the 1st active tab (should only be one at a time)
			this.closeTab(activeTabs[0]);
		}
	}

	/**
	 * Evaluate whether the before and after controls should be enabled or disabled.
	 * If the header is at the beginning of the list (scroll distance is equal to 0) then disable the
	 * before button. If the header is at the end of the list (scroll distance is equal to the
	 * maximum distance we can scroll), then disable the after button.
	 *
	 * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
	 * should be called sparingly.
	 */
	_checkScrollingControls() {
		// Check if the pagination arrows should be activated.
		this._disableScrollBefore = this.scrollDistance == 0;
		this._disableScrollAfter = this.scrollDistance == this._getMaxScrollDistance();

	}

	/** Sets the distance in pixels that the tab header should be transformed in the X-axis. */
	set scrollDistance(v: number) {
		this._scrollDistance = Math.max(0, Math.min(this._getMaxScrollDistance(), v));
	}

	get scrollDistance(): number { return this._scrollDistance; }

	/** Performs the CSS transformation on the tab list that will cause the list to scroll. */
	_updateTabScrollPosition() {
		const translateX = -this.scrollDistance;
		this._tabList.nativeElement.style.transform = `translate3d(${translateX}px, 0, 0)`;
		this._checkScrollingControls();
	}

	/**
	 * Moves the tab list in the 'before' or 'after' direction (towards the beginning of the list or
	 * the end of the list, respectively). The distance to scroll is computed to be a third of the
	 * length of the tab list view window.
	 *
	 * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
	 * should be called sparingly.
	 */
	scrollHeader(scrollDir: ScrollDirection) {
		const viewLength = this._tabListContainer.nativeElement.offsetWidth;

		// Move the scroll distance one-third the length of the tab list's viewport.
		this.scrollDistance += (scrollDir == 'before' ? -1 : 1) * viewLength / 3;
		this._updateTabScrollPosition();
	}

	/**
	 * Determines what is the maximum length in pixels that can be set for the scroll distance. This
	 * is equal to the difference in width between the tab list container and tab header container.
	 *
	 * This is an expensive call that forces a layout reflow to compute box and scroll metrics and
	 * should be called sparingly.
	 */
	_getMaxScrollDistance(): number {
		const lengthOfTabList = this._tabList.nativeElement.scrollWidth;
		const viewLength = this._tabListContainer.nativeElement.offsetWidth;
		return (lengthOfTabList - viewLength) || 0;
	}

	/** Tells the ink-bar to align itself to the current label wrapper */
	private _alignInkBarToSelectedTab(): void {
		if (this._selectedTab)
			this._inkBar.alignToElement(this._selectedTab);
	}

}
