import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/authentication/authentication.service';

@Component({
  selector: 'app-licence-down',
  styleUrls: ['./licence-down.component.scss'],
  templateUrl: './licence-down.component.html',
})
export class AuthLicenceDownComponent {

	constructor(private authService: AuthenticationService) {
	}

	gotoLogin() {
		this.authService.logout();
	}
}
