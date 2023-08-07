import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/authentication/authentication.service';

@Component({
  selector: 'app-not-licence',
  styleUrls: ['./not-licence.component.scss'],
  templateUrl: './not-licence.component.html',
})
export class AuthNotLicenceComponent {

	constructor(private authService: AuthenticationService) {
	}

	gotoLogin() {
		this.authService.logout();
	}
}
