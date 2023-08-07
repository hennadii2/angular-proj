import { Tab } from "../tab/tab";

export class PagesMenu{
    title: string;
    icon: string;
    tab: Tab;
    children?: PagesMenu[];
}