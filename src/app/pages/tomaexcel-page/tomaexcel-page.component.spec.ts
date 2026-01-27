import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TomaexcelPageComponent } from './tomaexcel-page.component';

describe('TomaexcelPageComponent', () => {
  let component: TomaexcelPageComponent;
  let fixture: ComponentFixture<TomaexcelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TomaexcelPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TomaexcelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
