import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardctComponent } from './dashboardct.component';

describe('DashboardctComponent', () => {
  let component: DashboardctComponent;
  let fixture: ComponentFixture<DashboardctComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardctComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardctComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
