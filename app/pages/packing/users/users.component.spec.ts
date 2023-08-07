import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingSearchComponent } from './search.component';

describe('PackingSearchComponent', () => {
	let component: PackingSearchComponent;
	let fixture: ComponentFixture<PackingSearchComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ PackingSearchComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PackingSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
