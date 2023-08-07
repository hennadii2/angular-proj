import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DataDrivenModalWebPageComponent } from './modal-web-page.component';

describe('DataDrivenModalWebPageComponent', () => {
	let component: DataDrivenModalWebPageComponent;
	let fixture: ComponentFixture<DataDrivenModalWebPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				DataDrivenModalWebPageComponent
			]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenModalWebPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
