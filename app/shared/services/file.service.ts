import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TokenStorage } from '../authentication/token-storage.service';


@Injectable()
export class FileService {
    headers: HttpHeaders;
    baseUrl: string;
    constructor(private http: HttpClient,
            private tokenStorage: TokenStorage) { 
        this.headers = new HttpHeaders();
        this.headers = this.headers.append('Content-Type', 'application/x-www-form-urlencoded');

        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
    }


    uploadFile(data: any): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        const url = `${this.baseUrl}/upload`;
        return this.http.request(
            new HttpRequest('POST', url,  data, { reportProgress: true}
        )).pipe(
            catchError(this.handleError)
        )
    }

    downloadFile(endpoint: string): Observable<any> {
        this.baseUrl = `${this.tokenStorage.getServerIp()}`;
        let url: string = "";
        if (!endpoint || endpoint.trim()== "") {
          url = `${this.baseUrl}/download`;
        } else {
          url = `${this.baseUrl}${endpoint}`
        }
        return this.http.request(
            new HttpRequest(
                'GET', 
                url,  
                { responseType: "text"}
        ))
        .pipe(
            catchError(this.handleError)
        )
    //    return this.http.get(`${url}?filename=${filename}`).pipe(
    //         catchError(this.handleError)
    //    );
    }

    getFileNameFromHttpResponse(httpResponse) {
        const contentDisposition = httpResponse.headers.get('content-disposition') || '';
        const matches = /filename=([^;]+)/ig.exec(contentDisposition);
        const fileName = (matches[1] || 'untitled').trim();
        return fileName;
    }

    GetFileType(filename: string){  

        let checkFileType =  filename.split('.').pop();
        var fileType;
        if(checkFileType == "txt"){
          fileType = "text/plain";
        } else if(checkFileType == "pdf"){
          fileType = "application/pdf";
        } else if(checkFileType == "doc") {
          fileType = "application/vnd.ms-word";
        } else if(checkFileType == "docx") {
          fileType = "application/vnd.ms-word";
        } else if(checkFileType == "xls"){
          fileType = "application/vnd.ms-excel";
        } else if(checkFileType == "png"){
          fileType = "image/png";
        } else if(checkFileType == "jpg"){
          fileType = "image/jpeg";
        } else if(checkFileType == "jpeg"){
          fileType = "image/jpeg";
        } else if(checkFileType == "gif")
        {
          fileType = "image/gif";
        } else if(checkFileType == "csv")
        {
          fileType = "text/csv";
        } else {
            fileType = "application/octet-stream";
        }
        return fileType;
	}


	b64toBlob(b64Data, contentType, sliceSize = 512) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;
	  
		var byteCharacters = atob(b64Data);
		var byteArrays = [];
	  
		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		  var slice = byteCharacters.slice(offset, offset + sliceSize);
		
		  var byteNumbers = new Array(slice.length);
		  for (var i = 0; i < slice.length; i++) {
			  byteNumbers[i] = slice.charCodeAt(i);
		  }
		
		  var byteArray = new Uint8Array(byteNumbers);
		
		  byteArrays.push(byteArray);
		}
	  
		var blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}

    private handleError(error: Response | any) {
        console.error('ApiService::handleError', error);
        return Observable.throw(error);
    }
}