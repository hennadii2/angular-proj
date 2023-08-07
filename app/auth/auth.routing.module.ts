import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { AuthLoginComponent } from './login/login.component';
import { AuthNotLicenceComponent } from './not-licence/not-licence.component';
import { AuthLicenceDownComponent } from './licence-down/licence-down.component';

export const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		children: [
			{ path: 'login', component: AuthLoginComponent },
			{ path: 'not-licence', component: AuthNotLicenceComponent },
			{ path: 'licence-down', component: AuthLicenceDownComponent },
			{ path: '', redirectTo:'login' },
		]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule ]
})
export class AuthRoutingModule {}