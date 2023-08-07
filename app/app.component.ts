import { Component, ViewEncapsulation } from '@angular/core';
import { Globals } from './shared/constants/globals';
import { LicenceService } from './shared/authentication/licence.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TokenStorage } from './shared/authentication/token-storage.service';
import { Router } from '@angular/router';

const DOWN_TIME_HOURS = 1;
const CHECK_TIME_SECONDS = 60;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	encapsulation:ViewEncapsulation.None
})
export class AppComponent {
	title = 'eon-app';
	private componetDestroyed = new Subject();  
	private licenceTimeDestroyed = new Subject();

	constructor(
		private licenceService: LicenceService,
		private tokenStorage: TokenStorage,
		private router: Router,
		private globals: Globals) {

		document.addEventListener('LicenceAdded', (event: any) => {
			this.globals.appLicence = event.detail.applicense;

			this.globals.apiUrl = event.detail.apiUrl;
			this.globals.logoUrl = event.detail.logoUrl;
			this.globals.siteUrl = event.detail.siteUrl;
		});

		this.licenceService.getCheckLicenceAction().pipe(
			takeUntil(this.componetDestroyed)
		).subscribe (res=>{
			this.setLicenceTime(res);
		}); 

		this.startLicenceTime();
	}

	ngOnDestroy() {	
		this.componetDestroyed.next();
		this.componetDestroyed.unsubscribe();

		this.stopLicenceTime();
	}

	startLicenceTime() {
		interval(1000 * CHECK_TIME_SECONDS).pipe(
			takeUntil(this.licenceTimeDestroyed)
		).subscribe(x=>{
			this.checkLicenceServer();
		});
	}

	stopLicenceTime() {
		this.licenceTimeDestroyed.next();
		this.licenceTimeDestroyed.unsubscribe();
	}

	checkLicence(eonserverip: string) {
    this.licenceService.checkLicense(this.globals.appLicence, eonserverip)
			.subscribe(res => {
        this.globals.isLicenceActivated = res.active;
        if (res.active) {
          // this.licenceInfo = res.data;
          // this.login();
        } else {
					this.tokenStorage.clear();
          this.router.navigate(['/auth/not-licence']);
          return;
        }

				this.tokenStorage.removeLicenceCheckTime();
      }, err => {
				this.globals.isLicenceActivated = false;
				this.tokenStorage.clear();
        this.router.navigate(['/auth/licence-down']);
      });
  }

	setLicenceTime(noApiError: boolean) {
		let previousTimeStr = this.tokenStorage.getLicenceCheckTimeStr();
		let previousTime: any = new Date(previousTimeStr);
		if (noApiError) {
			this.tokenStorage.removeLicenceCheckTime();
		} else if (!previousTimeStr || previousTime=="Invalid Date"){
			let currentTime = new Date();
			this.tokenStorage.setLicenceCheckTime(currentTime);
		}
	}

	checkLicenceServer() {
		let currentTime = new Date();
		let previousTimeStr = this.tokenStorage.getLicenceCheckTimeStr();
		let previousTime: any = new Date(previousTimeStr);

		if (previousTimeStr && previousTime!="Invalid Date" && previousTime){
			currentTime.setHours(currentTime.getHours() - DOWN_TIME_HOURS);

			if (currentTime > previousTime) {
				let ip = this.tokenStorage.getServerIp();
				this.checkLicence(ip);
			}
		}
	}
}
