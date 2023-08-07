import { NgModule } from '@angular/core';
import { TokenStorage } from './token-storage.service';
import { AuthenticationService } from './authentication.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { ErrorInterceptor } from '../interceptors/error.interceptor';
import { PublicGuard } from './public.guard';
import { ProtectGuard } from './protect.guard';
import { LicenceService } from './licence.service';
import { LicenceGuard } from './licence.guard';

export function factory(authenticationService: AuthenticationService) {
  return authenticationService;
}

@NgModule({
    imports: [ ],
    providers: [
      TokenStorage,
      PublicGuard,
      ProtectGuard,
      LicenceGuard,
      AuthenticationService,
      LicenceService,
      { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ]
})
export class AuthenticationModule {
}