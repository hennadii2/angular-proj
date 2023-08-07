import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import {tap} from "rxjs/operators";
import { TokenStorage } from '../authentication/token-storage.service';
import { AuthenticationService } from '../authentication/authentication.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private current_token;
    constructor(private tokenStorage: TokenStorage, 
        private authenticationService: AuthenticationService) {
            this.current_token = this.tokenStorage.getToken();
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      //*** add authorization header with jwt token if available
      this.current_token = this.tokenStorage.getToken();

      if (this.current_token) {
          request = request.clone({
              setHeaders: {
                  Authorization: 'Bearer ' + this.current_token,
                  Accept: 'application/json'
              }
          });
      } else {
        request = request.clone({
            setHeaders: {
                Accept: 'application/json'
            }
        });
      }

      
      return next.handle(request).pipe(
        tap(event => {
            if (event instanceof HttpResponse) {
                if (event && event.body && event.body.error=="Token is expired.") {
                    this.authenticationService.logout();
                }
            }
        }, error => {
          // http response status code
            console.error("[Error Response] status code: "+error.status+" message: "+error.message);
            //this.authenticationService.logout();
        })
      );
    }
}
