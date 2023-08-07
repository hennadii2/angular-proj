import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumKeypadComponent } from './num-keypad.component';

describe('NumKeypadComponent', () => {
	let component: NumKeypadComponent;
	let fixture: ComponentFixture<NumKeypadComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ NumKeypadComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NumKeypadComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
