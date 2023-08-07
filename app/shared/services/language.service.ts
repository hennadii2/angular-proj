import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


export enum Languages {
    English  = "en",
    Dutch    = "nl",
    German   = "de",
    French   = "fr"
}

const LANG_STORAGE_KEY = 'current_language';
@Injectable()
export class LanguageService {
    public language:string;
    
    constructor(
        private translate   : TranslateService) {
        const browserLang = this.translate.getBrowserLang();
        this.language = browserLang.match(/en|nl|de|fr/) ? browserLang :Languages.English;
        this.translate.addLangs([Languages.English, Languages.Dutch, Languages.German, Languages.French]);
        //this.setLang( this.getLang() );
    }

    setLang( lang:string ) {
        this.language = lang;
        this.translate.use( lang );  
        localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify( lang ));     
        
    }
    getLang():string {
        this.language = localStorage.getItem(LANG_STORAGE_KEY);
        return this.language ? JSON.parse(this.language) : Languages.English;
    }

    reloadLang(lang: string) {
        this.translate.reloadLang(lang);
    }
    public get( key : string ){
        return this.translate.get( key );
    }

    public instant(key: string) {
        return this.translate.instant(key);
    }
}
