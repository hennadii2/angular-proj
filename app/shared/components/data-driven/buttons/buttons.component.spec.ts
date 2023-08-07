import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenButtonsComponent } from './buttons.component';

describe('DataDrivenButtonsComponent', () => {
	let component: DataDrivenButtonsComponent;
	let fixture: ComponentFixture<DataDrivenButtonsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenButtonsComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenButtonsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
