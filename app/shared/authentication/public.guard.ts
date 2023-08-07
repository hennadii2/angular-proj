import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenStorage } from './token-storage.service';
import { LicenceService } from './licence.service';
import { Globals } from '../constants/globals';

@Injectable()
export class PublicGuard implements CanActivate {
  public authToken;
  private isAuthenticated = true; // Set this value dynamically

  constructor(
    private router: Router,
    private tokenStorage: TokenStorage,
	  private globals: Globals) {}
    
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    // let isLicenced: boolean = this.globals.isLicenceActivated;
    let isAuthenticated: boolean = !!this.tokenStorage.getToken();

    if (isAuthenticated) {
      this.router.navigate(['/pages/home']);
      return false;
    }

    return true;
  }
}
