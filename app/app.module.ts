import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ThemeModule } from './@theme/theme.module';
import { CoreModule } from './@core/core.module';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LanguageService } from './shared/services/language.service';
import * as Raven from 'raven-js';
import { NgbModule } from './shared/ng-bootstrap';
import { Globals } from './shared/constants/globals';
import { AuthenticationModule } from './shared/authentication/authentication.module';
Raven.config('').install();

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  	declarations: [
    	AppComponent
  	],
  	imports: [
  		BrowserModule,
  		BrowserAnimationsModule,
  		AppRoutingModule,
  		HttpClientModule,
  		AuthenticationModule,
  		// SharedModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
  		}),
  		NgbModule,
  		ThemeModule.forRoot(),
  		CoreModule.forRoot(),
    ],
  	bootstrap: [AppComponent],
  	providers: [
		{ provide: APP_BASE_HREF, useValue: '/' },
		LanguageService,
		Globals,
  	],
})
export class AppModule { }
