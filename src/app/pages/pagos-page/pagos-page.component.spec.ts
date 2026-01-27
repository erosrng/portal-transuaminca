import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosPageComponent } from './pagos-page.component';

describe('PagosPageComponent', () => {
  let component: PagosPageComponent;
  let fixture: ComponentFixture<PagosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
