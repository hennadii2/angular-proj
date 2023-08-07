import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenChartComponent } from './chart.component';

describe('DataDrivenChartComponent', () => {
	let component: DataDrivenChartComponent;
	let fixture: ComponentFixture<DataDrivenChartComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenChartComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
