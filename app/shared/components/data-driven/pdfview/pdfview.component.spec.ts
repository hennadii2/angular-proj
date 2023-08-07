import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenPDFViewComponent } from './pdfview.component';

describe('DataDrivenPDFViewComponent', () => {
	let component: DataDrivenPDFViewComponent;
	let fixture: ComponentFixture<DataDrivenPDFViewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenPDFViewComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenPDFViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
