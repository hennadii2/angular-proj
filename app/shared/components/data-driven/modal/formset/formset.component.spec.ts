import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenModalFormSetComponent } from './formset.component';

describe('DataDrivenModalFormSetComponent', () => {
	let component: DataDrivenModalFormSetComponent;
	let fixture: ComponentFixture<DataDrivenModalFormSetComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenModalFormSetComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenModalFormSetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
