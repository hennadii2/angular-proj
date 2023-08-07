import { Component, OnInit, SimpleChanges, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';
import * as _ from 'lodash';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ButtonType } from '../../models/data-driven.model';
import { TokenStorage } from '../../authentication/token-storage.service';


@Component({
	selector: 'app-device-info',
	templateUrl: './device-info.component.html',
	styleUrls: ['./device-info.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DeviceInfoComponent implements OnInit {
	ButtonType = ButtonType;
	deviceInfo = null;
	isMobile: boolean = false;
	isTablet: boolean = false;
	isDesktop: boolean = false;
	ip: string;
	@Input() buttons: ButtonType[];
	disabled_buttons: ButtonType[];
	gpsPosition;

	@Output() onExit = new EventEmitter();

	constructor(
		private deviceService: DeviceDetectorService,
		private tokenStorage: TokenStorage
	) {
		this.ip = this.tokenStorage.getServerIp();
	}

	ngOnInit() {
		this.epicFunction();
		this.getGPSLocation();
	}

	ngAfterViewInit() {
	}
	
	ngOnChanges(changes: SimpleChanges) {
	}

	ngDoCheck() {
	}

	ngOnDestroy() {
	}

	epicFunction() {
		this.deviceInfo = this.deviceService.getDeviceInfo();
		this.isMobile = this.deviceService.isMobile();
		this.isTablet = this.deviceService.isTablet();
		this.isDesktop = this.deviceService.isDesktop();
	}

	getGPSLocation() {
		if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(position =>{
			this.gpsPosition = position;
			console.log(position);
		  });
		}
	}
	  

	exit() {
		this.onExit.next();
	}
}
