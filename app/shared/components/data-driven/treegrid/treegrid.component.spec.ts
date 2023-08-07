import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenTreeGridComponent } from './treegrid.component';

describe('DataDrivenTreeGridComponent', () => {
	let component: DataDrivenTreeGridComponent;
	let fixture: ComponentFixture<DataDrivenTreeGridComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenTreeGridComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenTreeGridComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
