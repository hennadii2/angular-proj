import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TokenStorage } from '../authentication/token-storage.service';
import * as moment from 'moment';

const BASE_URL = `${environment.licenceUrl}/licence/check.php`;
const DT_FORMAT = "YYYY-MM-DD HH:mm:ss";
// const BASE_URL = `${environment.licenceUrl}/v1.0/licence`;
// const DT_FORMAT = "YYYY-MM-DD:HH:mm:ss";

@Injectable()
export class LicenceService {
    
    private checkLicenceAction = new Subject<any>();

    constructor(private http: HttpClient) { 
    }


    toggleCheckLicenceAction( active: boolean ) {
        this.checkLicenceAction.next(active);
    }
    getCheckLicenceAction() {
        return this.checkLicenceAction.asObservable();
    }

    checkLicense(licence: string, eonserver: string): Observable<any> {

        let data = {
            licence: btoa(licence), 
            eonserver: btoa(eonserver)
        };

        return this.http.put(BASE_URL,data).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: Response | any) {
        console.error('LicenceService::handleError', error);
        return Observable.throw(error);
    }
}