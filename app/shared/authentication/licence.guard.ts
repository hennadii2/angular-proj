import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LicenceService } from './licence.service';
import { Globals } from '../constants/globals';

@Injectable()
export class LicenceGuard implements CanActivate {
  private addedLicence = true; // Set this value dynamically

  constructor(
    private router: Router,
    private globals: Globals) {}
    
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let isLicenced: boolean = this.globals.isLicenceActivated;

    if (!isLicenced) {

      this.router.navigate(['/auth/not-licence']);
      return false
    }

    return true;
  }
}
