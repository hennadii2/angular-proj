import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenStorage } from '../authentication/token-storage.service';




@Injectable()
export class PackingService {
    baseUrl: string;
    constructor(private http: HttpClient,
        private tokenStorage: TokenStorage) { 
            
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
    }

    getUsers() : Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let url = `${this.baseUrl}/files/users`;

        return this.http.get(url).pipe(
            catchError(this.handleError)
        );
    }

    setUser(user): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let url = `${this.baseUrl}/files/users/${user}`;

        return this.http.put(url,{}).pipe(
            catchError(this.handleError)
        );
    }

    getProducts(data: any): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let url = `${this.baseUrl}/startpack/M`;

        return this.http.put(url, data).pipe(
            catchError(this.handleError)
        );
    }

    getProductLocations(art_nummer: any, headers: boolean = false): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let url = `${this.baseUrl}/files/artlocatie?key=${art_nummer}&headers=${headers ? 1 : 0}`;

        return this.http.get(url).pipe(
            catchError(this.handleError)
        );
    }

    getSubProducts(art_nummer: any, hoev: any): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let url = `${this.baseUrl}/files/artprod?key=${art_nummer}&hoev=${hoev}`;

        return this.http.get(url).pipe(
            catchError(this.handleError)
        );
    }

    clickPackingButton(id: any, button: string, data: any[]): Observable<any> {
        let url = `${this.baseUrl}/endpack/${id}?button=${button}`;

        return this.http.put(url, data).pipe(
            catchError(this.handleError)
        );
    }


    private handleError(error: Response | any) {
        console.error('ApiService::handleError', error);
        return Observable.throw(error);
    }
}