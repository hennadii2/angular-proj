import { Injectable } from '@angular/core';
import { Tab } from './tab';
import { TabComponent } from './tab/tab.component';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class TabService {
    private tab: Subject<Tab> = new Subject();
    tabActived: BehaviorSubject<TabComponent> = new BehaviorSubject(null);
    currentTab: TabComponent;
    
    tabClosed: Subject<string> = new Subject();
    
    constructor() { }

    openTab(newTab: Tab) {
        this.tab.next(newTab);
    }

    closeTab(url: string) {
        this.tabClosed.next(url);
    }

    get tab$(): Observable<Tab> {
        return this.tab.asObservable();
    }
}
