import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenFormComponent } from './form.component';

describe('DataDrivenFormComponent', () => {
	let component: DataDrivenFormComponent;
	let fixture: ComponentFixture<DataDrivenFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenFormComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
