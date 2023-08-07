import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenModalEditSchedulerComponent } from './edit-scheduler.component';

describe('DataDrivenModalEditSchedulerComponent', () => {
	let component: DataDrivenModalEditSchedulerComponent;
	let fixture: ComponentFixture<DataDrivenModalEditSchedulerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenModalEditSchedulerComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenModalEditSchedulerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
