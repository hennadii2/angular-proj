import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingWarehouseComponent } from './warehouse.component';

describe('PackingWarehouseComponent', () => {
	let component: PackingWarehouseComponent;
	let fixture: ComponentFixture<PackingWarehouseComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ PackingWarehouseComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PackingWarehouseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
