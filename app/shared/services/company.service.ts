import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TokenStorage } from '../authentication/token-storage.service';




@Injectable()
export class CompanyService {
    baseUrl: string;
    constructor(private http: HttpClient,
        private tokenStorage: TokenStorage) { 
            
        this.baseUrl = `${this.tokenStorage.getServerIp()}/company`;
    }

    getCompanies() : Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}/company`;
        let url = `${this.baseUrl}`;

        return this.http.get(url).pipe(
            catchError(this.handleError)
        );
    }

    setCompany(company): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}/company`;
        let url = `${this.baseUrl}/${company}`;

        return this.http.put(url,{}).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: Response | any) {
        console.error('ApiService::handleError', error);
        return Observable.throw(error);
    }
}