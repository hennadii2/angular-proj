import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenSchedulerComponent } from './scheduler.component';

describe('DataDrivenSchedulerComponent', () => {
	let component: DataDrivenSchedulerComponent;
	let fixture: ComponentFixture<DataDrivenSchedulerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenSchedulerComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenSchedulerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
