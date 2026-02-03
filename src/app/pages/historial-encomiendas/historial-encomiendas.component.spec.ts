import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialEncomiendasComponent } from './historial-encomiendas.component';

describe('HistorialEncomiendasComponent', () => {
  let component: HistorialEncomiendasComponent;
  let fixture: ComponentFixture<HistorialEncomiendasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialEncomiendasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialEncomiendasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
