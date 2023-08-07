import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenStorage } from './token-storage.service';
import { LicenceService } from './licence.service';
import { Globals } from '../constants/globals';

@Injectable()
export class ProtectGuard implements CanActivate {
  public authToken;

  constructor(
    private router: Router,
    private tokenStorage: TokenStorage,
	  private globals: Globals) {}
    
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //The storage will have the authToken
    // let isLicenced: boolean = this.globals.isLicenceActivated;
    let isAuthenticated: boolean = !!this.tokenStorage.getToken();

    if (!isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // if (!isLicenced) {
    //   this.router.navigate(['/auth/not-licence']);
    //   return false;
    // }


    return true;
  }
}
