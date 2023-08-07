import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenTimelineComponent } from './timeline.component';

describe('DataDrivenTimelineComponent', () => {
	let component: DataDrivenTimelineComponent;
	let fixture: ComponentFixture<DataDrivenTimelineComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenTimelineComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenTimelineComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
