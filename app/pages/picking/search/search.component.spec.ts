import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickingSearchComponent } from './search.component';

describe('PickingSearchComponent', () => {
	let component: PickingSearchComponent;
	let fixture: ComponentFixture<PickingSearchComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ PickingSearchComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PickingSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
