import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDrivenModalEditKanbanComponent } from './edit-kanban.component';

describe('DataDrivenModalEditKanbanComponent', () => {
	let component: DataDrivenModalEditKanbanComponent;
	let fixture: ComponentFixture<DataDrivenModalEditKanbanComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ DataDrivenModalEditKanbanComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataDrivenModalEditKanbanComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
