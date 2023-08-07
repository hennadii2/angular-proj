import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap} from 'rxjs/operators';

import { TokenStorage } from './token-storage.service';
import { LanguageService, Languages } from '../services/language.service';
import { Menu } from '../models/menu.model';

import { TokenData } from 'src/app/interfaces/token/token';

import { environment } from 'src/environments/environment';

@Injectable()
export class AuthenticationService {
  private httpOptions = {
    headers: new HttpHeaders({'Content-Type' : 'application/json'}),
  }
  
  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private langService: LanguageService,
    private router: Router
  ) {}

  public login(ip: string, user: string, pwd: string): Observable<any> {
    let authData = btoa(`${user}:${pwd}`)
    
    this.tokenStorage.setCurrentUser(authData)

    this.httpOptions.headers = new HttpHeaders().set("Authorization", `Basic ${authData}`)
    
    let baseUrl = `${this.tokenStorage.getServerIp()}`
  
    return this.http
                .get(`${baseUrl}/login`, this.httpOptions)
                .pipe(tap((tokens: TokenData) => this.saveTokenData(tokens)))
  }

  /**
   * Logout
   */
  public logout(): void {
    this.tokenStorage.clear()
    this.router.navigate(['/auth'])
  }

  /**
   * Save access data in the storage
   *
   * @private
   * @param {AccessData} data
   */
  private saveTokenData(response: TokenData) {
    if (response.login === 'ok') {
      this.tokenStorage.setAppName(response.appname)
      this.tokenStorage.setButtonCorner(response.buttoncorner)
      this.tokenStorage.setToken(response.token)
      this.tokenStorage.setUserCompanies(response.company)
      this.tokenStorage.SetUserMenu(response.menu)
      this.tokenStorage.SetUserTopMenu(response.topmenu)
      this.tokenStorage.setIonfoPagesUrl(response.infopages)
      this.tokenStorage.setDashboardData(response.dashboard)
      this.langService.setLang(response.language ? response.language.toLowerCase() : Languages.English)
      console.log(`dashboard data: `);
      console.log(response.dashboard);
    } else {
      this.tokenStorage.clearToken()
    }
  }
}