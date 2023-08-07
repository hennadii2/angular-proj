import { Component, ViewChild, ElementRef, Renderer2, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { Languages, LanguageService } from 'src/app/shared/services/language.service';
import { AuthenticationService } from 'src/app/shared/authentication/authentication.service';
import { NbToastrService } from '@nebular/theme';
import { CustomValidators } from 'src/app/shared/validators/custom-validators';
import { TokenStorage } from 'src/app/shared/authentication/token-storage.service';
import { environment } from 'src/environments/environment';
import { Globals } from 'src/app/shared/constants/globals';
import { LicenceService } from 'src/app/shared/authentication/licence.service';
import { ModalAlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { NgbModal } from 'src/app/shared/ng-bootstrap';
import { DeviceDetectorService } from 'ngx-device-detector';

export class LicenceInfo {
    id: any;
    customer_name: string;
    licence: string;
    eonserver: string;
    expiration_at: string;
    connections: number;
    last_at: string;
    is_demo: string;
}

const BASE_SITE_URL = 'https://aboservice.be';

const langs = [
    {id: Languages.English, title: 'LANGUAGES.ENGLISH'},
    {id: Languages.Dutch, title: 'LANGUAGES.DUTCH'},
    {id: Languages.French, title: 'LANGUAGES.FRENCH'},
    {id: Languages.German, title: 'LANGUAGES.GERMAN'}
  ];
  
@Component({
    selector    : 'app-auth-login',
    templateUrl : './login.component.html',
    styleUrls   : ['./login.component.scss']
})
export class AuthLoginComponent implements OnInit
{
    langs = langs;
    selectedLang: any;

    form: FormGroup;
    formErrors: any;
    isSuccess = true;
    isSubmitted = false;
    licenceInfo: LicenceInfo;

    @ViewChild('username') usernameEL: ElementRef;
    @ViewChild('password') passwordEL: ElementRef;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private langService: LanguageService,
        private authService: AuthenticationService,
        private licenceService: LicenceService,
        private tokenStorage: TokenStorage,  
        private modalService: NgbModal,
        private globals: Globals    
    ){
        this.selectedLang = this.langService.getLang();
        this.langService.setLang(this.selectedLang);        
        this.formErrors = {
            ip     : {},
            user   : {},
            password: {}
        };        
    }

    ngOnInit()
    {        
        let serverip = this.tokenStorage.getServerIp();
        if (serverip == environment.apiUrl) serverip = "";
        this.form = this.formBuilder.group({
            ip      : [serverip, []], //CustomValidators.ipAddress
            user   : ['', [Validators.required]],
            password: ['', [Validators.required]]
        });

        this.form.valueChanges.subscribe(() => {
			this.isSuccess = true;
        });

    }

    ngAfterViewInit() {
        //ngb-modal-backdrop, ngb-modal-window
        let modalEls: NodeList = document.querySelectorAll("ngb-modal-backdrop, ngb-modal-window");
        modalEls.forEach(modalEl=>{
            modalEl.parentNode.removeChild(modalEl);
        });
        this.showMainSpinner(false);
    }

    checkLicence(eonserverip: string) {
        this.licenceService.checkLicense(this.globals.appLicence, eonserverip).subscribe(
            res=>{
                this.globals.isLicenceActivated = res.active;
                if (res.active) {
                    this.licenceInfo = res.data;
                    this.login();
                } else {
                    // this.toastrService.danger("You have must purchase Licence Key for using this sytem!!!", "Error");
                    this.isSubmitted = false;
                    this.router.navigate(['/auth/not-licence']);
                    return;
                }

                this.licenceService.toggleCheckLicenceAction(true);
            }, err=>{

                this.globals.isLicenceActivated = true;
                // this.toastrService.danger("You have must purchase Licence Key for using this sytem!!!", "Error");
                // this.router.navigate(['/auth/not-licence']);
                let previousTimeStr = this.tokenStorage.getLicenceCheckTimeStr();
                let previousTime: any = new Date(previousTimeStr);
                let currentTime = new Date();
                currentTime.setHours(currentTime.getHours() - 1);
                if (!previousTimeStr || previousTime =="Invalid Date" || currentTime <= previousTime){
                    this.licenceService.toggleCheckLicenceAction(false);
                    this.goHome();
                } else {
                    this.isSubmitted = false;
                    this.router.navigate(['/auth/licence-down']);
                }
            });
    }

    

    changeLanuage(event) {
        this.langService.setLang(this.selectedLang);
    }

    submit() {
        if (this.isSubmitted) return;
        this.isSubmitted = true;

        let ip = (this.globals.apiUrl && this.globals.apiUrl != "") ? this.globals.apiUrl : this.form.getRawValue().ip;

        this.tokenStorage.setServerIp(ip);
        ip = this.tokenStorage.getServerIp();

        this.checkLicence(ip);
    }
		
     login() {
        this.tokenStorage.clear();
        const user = this.form.getRawValue().user;
        const password = this.form.getRawValue().password;
        const ip = this.tokenStorage.getServerIp();

        this.authService.login(ip, user, password).subscribe(result=>{
            let useDate = new Date();
            useDate.setDate(useDate.getDate() + 10);

            if (result.login=='ok') {
                let message: string = "";
                if (this.licenceInfo && this.licenceInfo.is_demo =="1") {
                    message = `Your system is demo version. <br> 
                    You can use the system until ${this.licenceInfo.expiration_at}. <br> 
                    Please purchase a new licence for getting full version system.`;
                    this.openAlertModal('Alert', message, this.goHome.bind(this));
                } else if (this.licenceInfo && new Date(this.licenceInfo.expiration_at) <  useDate){
                    message = `Your licence is almost expired. <br> 
                    Your expiration date is ${this.licenceInfo.expiration_at}. <br>
                    You need to purchase a new licence during that time.`;
                    this.openAlertModal('Alert', message, this.goHome.bind(this));
                } else {
                    this.goHome();
                }
            } else {
                this.openAlertModal("Error", "User name and Password is not matched!!! please type username and password correctly.", this.focusUserName.bind(this));
                this.isSuccess = false;
                this.isSubmitted = false;
            }
        }, err=>{
            this.openAlertModal("Error", err, this.focusUserName.bind(this));
            this.isSuccess = false;
            this.isSubmitted = false;
        });
    }
    
	openAlertModal(title: string, message: string, callBackFunc: any = null) {
		let modal_param = {centered: true, windowClass: 'alert-modal'};

		const deviceModalRef = this.modalService.open(ModalAlertComponent, modal_param);
		deviceModalRef.componentInstance.title = title;
		deviceModalRef.componentInstance.message = message;

		deviceModalRef.result.then(result=>{
            if (callBackFunc) callBackFunc();
		});
    }
    
    goHome() {
        this.showMainSpinner(true);
        this.router.navigate(['/pages/home']);
    }

    getSiteUrl() {
        let url = this.globals.siteUrl;
        return !!url && url != "" ? url : BASE_SITE_URL;
    }

    getLogoImgUrl() {
        return this.globals.logoUrl && this.globals.logoUrl!='' ? this.globals.logoUrl: 'assets/images/logo.jpg';
    }


    showMainSpinner(isShow: boolean) {
        let spinnerEl = document.getElementsByClassName("lds-css")[0];

        if (spinnerEl.classList.contains("d-none")) {
           if (isShow) spinnerEl.classList.remove("d-none")
        } else  {
           if (!isShow) spinnerEl.classList.add("d-none");
        }
    }

    focusUserName() {
        this.usernameEL.nativeElement.focus();
        this.usernameEL.nativeElement.select();
    }
}