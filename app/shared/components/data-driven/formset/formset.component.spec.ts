import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenFormSetComponent } from './formset.component';

describe('DataDrivenFormSetComponent', () => {
	let component: DataDrivenFormSetComponent;
	let fixture: ComponentFixture<DataDrivenFormSetComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenFormSetComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenFormSetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
