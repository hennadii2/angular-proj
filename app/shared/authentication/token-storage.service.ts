import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Company } from '../models/company.model';
import { Menu } from '../models/menu.model';
import { environment } from 'src/environments/environment';

const CURRENT_USER = "current_user";
const TOKEN_STR = "token";
const COMPANIES_STR = "user_companies";
const COMPANY_STR = "user_company";
const KEY_STR = "user_key";
const MENU_STR = "user_menu";
const TOP_MENU_STR = "user_top_menu";
const APP_NAME_STR = "app_name";
const APP_BUTTON_CORNER = "app_button_corner";
const APP_SERVER_IP  = "app_server_ip";
const INFOPAGES_STR = "infopages";
const DASHBOARD_DATA = 'dashboard_data';

const APP_PAKCING_INFO = "app_packing";
const LICENCE_TIME_STR = "licence_time";

const DEFAULT_BUTTON_CORNER = 5;
@Injectable()
export class TokenStorage {

    /**
   * Get Current User
   * @returns {Observable<string>}
   */
  public getCurrentUser(): string {
    const current_user: string = <string>localStorage.getItem(CURRENT_USER);
    return current_user;
  }

      /**
   * Get Token
   * @returns {Observable<string>}
   */
  public getToken(): string {
    const token: string = <string>localStorage.getItem(TOKEN_STR);
    return token;
  }

  public getServerIp(): string {
    const ip: string = <string>localStorage.getItem(APP_SERVER_IP);
    return ip && ip.trim()!="" ? ip : environment.apiUrl;
  }

  public getAppName(): string {
    const appname: string = <string>(localStorage.getItem(APP_NAME_STR));
    return appname;
  }

  
  public getButtonCornder(): number {
    const buttoncorner: number = Number((localStorage.getItem(APP_BUTTON_CORNER)));
    return typeof(buttoncorner) == "number" ? buttoncorner : DEFAULT_BUTTON_CORNER;
  }

  public getUserKey(): number {
    const key: number = parseInt(localStorage.getItem(KEY_STR));
    return key;
  }

  public getUserCompanies(): any {
    const companies: any = JSON.parse(localStorage.getItem(COMPANIES_STR));
    return companies;
  }
  
  public getDashboardData(): any {
    if (localStorage.getItem(DASHBOARD_DATA) !== `undefined`) {
      return JSON.parse(localStorage.getItem(DASHBOARD_DATA));
    } else {
      return false;
    }
  }
  
  public getUserCompany(): string {
    const company: string = <string>localStorage.getItem(COMPANY_STR);
    return company;
  }

  public getUserMenu(): Menu[]{
    const menus: Menu[] = <Menu[]>JSON.parse(localStorage.getItem(MENU_STR));
    return menus;
  }

  public getUserTopMenu(): Menu[]{
    let storageStr =(localStorage.getItem(TOP_MENU_STR));
    if (storageStr == "undenfied") return [];
    const menus: Menu[] = <Menu[]>JSON.parse(storageStr);
    return menus;
  }

  public getPackingInfo(): any[] {
    let storageStr =(localStorage.getItem(APP_PAKCING_INFO));
    if (storageStr == "undenfied") return null;
    const packingInfo = JSON.parse(storageStr);

    return packingInfo;
  }

  public getInfoPagesUrl(): string {
    const url: string = <string>localStorage.getItem(INFOPAGES_STR);
    return url;
  }

  public getLicenceCheckTimeStr(): string {
    const timeStr: string = <string>localStorage.getItem(LICENCE_TIME_STR);

    return timeStr;
  }

  /**
   * Set current user
   * @returns {TokenStorage}
   */
  public setCurrentUser(authData: string): TokenStorage {
    localStorage.setItem(CURRENT_USER, authData);

    return this;
  }

  /**
   * Set current user
   * @returns {TokenStorage}
   */
  public setToken(token: string): TokenStorage {
    localStorage.setItem(TOKEN_STR, token);

    return this;
  }
  
  public clearToken(): TokenStorage {
    localStorage.setItem(TOKEN_STR, '')

    return this
  }
  
  public setServerIp(ip: string): TokenStorage {
    localStorage.removeItem(APP_SERVER_IP);
    if (ip && ip.trim() != "") localStorage.setItem(APP_SERVER_IP, ip);
    return this;
  }

  public setAppName(appname: string): TokenStorage {
    localStorage.setItem(APP_NAME_STR, appname);

    return this;
  }

  public setButtonCorner(buttoncorner: number): TokenStorage {
    localStorage.setItem(APP_BUTTON_CORNER, buttoncorner.toString());

    return this;
  }


  public setUserKey(key: number): TokenStorage {
    localStorage.setItem(KEY_STR, key.toString());

    return this;
  }

  public setUserCompanies(companies: Company[]): TokenStorage {
    localStorage.setItem(COMPANIES_STR, JSON.stringify(companies) );

    return this;
  }

  public setUserCompany(company: string): TokenStorage {
    localStorage.setItem(COMPANY_STR, company);

    return this;
  }

  public SetUserMenu(menu: Menu[]): TokenStorage {
    localStorage.setItem(MENU_STR, JSON.stringify(menu));

    return this;
  }
  
  public SetUserTopMenu(menu: Menu[]): TokenStorage {
    localStorage.setItem(TOP_MENU_STR, JSON.stringify(menu));

    return this;
  }

  public setPackingInfo(packingInfo: any): TokenStorage {
    localStorage.setItem(APP_PAKCING_INFO, JSON.stringify(packingInfo));

    return this;
  }

  public setDashboardData(dashboardData: any): TokenStorage {
    localStorage.setItem(DASHBOARD_DATA, JSON.stringify(dashboardData));

    return this;
  }
  
  public setIonfoPagesUrl(url: string): TokenStorage {
    localStorage.setItem(INFOPAGES_STR, url);

    return this;
  }

  public setLicenceCheckTime(time: Date): TokenStorage {
    localStorage.setItem(LICENCE_TIME_STR, time.toString());
    return this;
  }

  public removeLicenceCheckTime(){
    localStorage.removeItem(LICENCE_TIME_STR);
  }

   /**
   * Remove tokens
   */
  public clear() {
    //localStorage.removeItem(APP_SERVER_IP);
    localStorage.removeItem(KEY_STR);
    localStorage.removeItem(COMPANIES_STR);
    localStorage.removeItem(COMPANY_STR);
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(TOKEN_STR);
    localStorage.removeItem(MENU_STR);
    localStorage.removeItem(TOP_MENU_STR);
    localStorage.removeItem(APP_NAME_STR);
    localStorage.removeItem(APP_BUTTON_CORNER);
    localStorage.removeItem(INFOPAGES_STR);
    localStorage.removeItem(DASHBOARD_DATA);
    // localStorage.removeItem(LICENCE_TIME_STR);
  }
}