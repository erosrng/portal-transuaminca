import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosPageComponent } from './pedidos-page.component';

describe('PedidosPageComponent', () => {
  let component: PedidosPageComponent;
  let fixture: ComponentFixture<PedidosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
