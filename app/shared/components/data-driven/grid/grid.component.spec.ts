import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenGridComponent } from './grid.component';

describe('DataDrivenGridComponent', () => {
	let component: DataDrivenGridComponent;
	let fixture: ComponentFixture<DataDrivenGridComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenGridComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenGridComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
