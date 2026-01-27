import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialpedComponent } from './historialped.component';

describe('HistorialpedComponent', () => {
  let component: HistorialpedComponent;
  let fixture: ComponentFixture<HistorialpedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialpedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialpedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
