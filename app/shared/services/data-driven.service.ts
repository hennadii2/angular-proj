import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TokenStorage } from '../authentication/token-storage.service';


@Injectable()
export class DataDrivenService {
    headers: HttpHeaders;
    baseUrl: string;
    constructor(private http: HttpClient,
            private tokenStorage: TokenStorage) { 
        this.headers = new HttpHeaders();
        this.headers = this.headers.append('Content-Type', 'application/x-www-form-urlencoded');

        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
    }

    getFormData(url: string, is_label: boolean) : Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.get(`${this.baseUrl}${url}${url.indexOf('?')  > -1 ? '&' : '?' }labels=${is_label ? 1 : 0}`).pipe(
            catchError(this.handleError)
        );
    }

    getSchedulerData(url: string, from: string, to: string, is_label: boolean) : Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let params = `&from=${from}&to=${to}`;
        return this.http.get(`${this.baseUrl}${url}${url.indexOf('?')  > -1 ? '&' : '?' }labels=${is_label ? 1 : 0}&from=${from}&to=${to}`).pipe(
            catchError(this.handleError)
        );
    }

    getGridData(url: string, is_header: boolean) : Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.get(`${this.baseUrl}${url}${url.indexOf('?')  > -1 ? '&' : '?' }headers=${is_header ? 1 : 0}`).pipe(
            catchError(this.handleError)
        );
    }

    getKanbanData(url: string, key: any, is_label: boolean) : Observable<any>{
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.get(`${this.baseUrl}${url}${url.indexOf('?')  > -1 ? '&' : '?' }key=${key}&labels=${is_label ? 1 : 0}`).pipe(
            catchError(this.handleError)
        );
    }

    getGridStructure(url: string): Observable<any>{
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.get(`${this.baseUrl}${url}/grid`).pipe(
            catchError(this.handleError)
        );
    }

    getKanbanStructure(url: string): Observable<any>{
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.get(`${this.baseUrl}${url}${url.indexOf('?')  > -1 ? '&' : '?' }key=-1&labels=1`).pipe(
            catchError(this.handleError)
        );
    }

    getData(url: string): Observable<any>{
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.get(`${this.baseUrl}${url}`).pipe(
            catchError(this.handleError)
        );
    }

    getFileData(url: string, search_key: string, is_header: boolean, fields?: string) : Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let result_url = `${this.baseUrl}/files/${url}?key=${search_key}&headers=${is_header ? 1 : 0}`;
        if (fields) result_url = `${result_url}&fields=${fields}`;
        return this.http.get(`${result_url}`).pipe(
            catchError(this.handleError)
        );
    }

    createData(url: string, data: any): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.post(`${this.baseUrl}${url}`, data).pipe(
            catchError(this.handleError)
        );
    }

    updateData(url: string, data: any): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.put(`${this.baseUrl}${url}`, data).pipe(
            catchError(this.handleError)
        );
    }

    deleteData(url: string): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        return this.http.delete(`${this.baseUrl}${url}`).pipe(
            catchError(this.handleError)
        );  
    }

    findConvertFields(value: string) {
        if (!value || value.length == 0) return [];
        let fieldsArr: string[]=[];
        let startIndex = -1;
        for (let i=1; i<value.length; i++) {
            if (value[i]=='{' && value[i-1]=='$') {
                startIndex = i + 1;
            } else if (value[i]=='}' && startIndex != -1) {
                let fieldStr = value.substring(startIndex, i);
                fieldsArr.push(fieldStr);
                startIndex = -1;
            }
        }

        return fieldsArr;
    }

    replaceFieldsOfUrl(url: string, id: any, data: any = null) {

      const fieldsArr = this.findConvertFields(url);
      let passed_url: string = url;

      fieldsArr.forEach(field => {
        if (field == "id") {
          passed_url = passed_url.replace('${' + field + '}', id);
        } else {
          const changeValue = isNaN(data[field]) ? data[field].trim() : data[field];
          if (data && data[field]) passed_url = passed_url.replace('${' + field + '}', changeValue);
        }
      });

      return passed_url;
    }

    private handleError(error: Response | any) {
        console.error('ApiService::handleError', error);
        return Observable.throw(error);
    }
}