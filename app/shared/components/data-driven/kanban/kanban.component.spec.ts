import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenKanbanComponent } from './kanban.component';

describe('DataDrivenKanbanComponent', () => {
	let component: DataDrivenKanbanComponent;
	let fixture: ComponentFixture<DataDrivenKanbanComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenKanbanComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenKanbanComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
