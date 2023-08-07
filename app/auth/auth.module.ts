import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth.routing.module';
import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './login/login.component';
import { ThemeModule } from '../@theme/theme.module';
import { AuthNotLicenceComponent } from './not-licence/not-licence.component';
import { AuthLicenceDownComponent } from './licence-down/licence-down.component';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ShowErrorsModule } from '../shared/validators/show-errors/show-errors.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalAlertModule } from '../shared/modals/alert/alert.module';


@NgModule({
	imports: [
		CommonModule,
		AuthRoutingModule,
		FormsModule,
		ThemeModule,
		TranslateModule,
		ShowErrorsModule,
		NgSelectModule,
		ModalAlertModule
		// SharedModule
	],
	declarations:[
		AuthComponent,
		AuthLoginComponent,
		AuthNotLicenceComponent,
		AuthLicenceDownComponent
	],
	providers:[],
	exports:[
		AuthComponent,
		AuthLoginComponent,
		AuthNotLicenceComponent,
		AuthLicenceDownComponent
	],
	entryComponents: []  
})

export class AuthModule{
}
