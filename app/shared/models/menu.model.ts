import { PageType, ButtonType, OnClick, PageSize, TypeView } from "./data-driven.model";

export class Menu {
    id: string;
    title: string;
    endpoint: string;
    icon: string;
    pagetype?: PageType;
    pagesize?: PageSize;
    hidefilter?: boolean;
    groupable?: boolean;
    hidefilterrow?: boolean;
    onclick?: OnClick;
    submenu?: Menu[];
    buttons?: ButtonType[]=[];
    actived?: boolean = false;   
    itemid?: string;
    position?: 'top' | 'bottom';
    rowrefresh?: string;
    fieldheight?: number;
    report?: string;
    draggable?: boolean;
    typeview?: TypeView[] = []
    hidetoolbar?: boolean = false;
}
