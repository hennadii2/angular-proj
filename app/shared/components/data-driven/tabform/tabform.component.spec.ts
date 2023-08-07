import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenTabFormComponent } from './tabform.component';

describe('DataDrivenTabFormComponent', () => {
	let component: DataDrivenTabFormComponent;
	let fixture: ComponentFixture<DataDrivenTabFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenTabFormComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenTabFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
