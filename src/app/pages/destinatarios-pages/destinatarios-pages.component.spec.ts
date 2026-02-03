import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinatariosPagesComponent } from './destinatarios-pages.component';

describe('DestinatariosPagesComponent', () => {
  let component: DestinatariosPagesComponent;
  let fixture: ComponentFixture<DestinatariosPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinatariosPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinatariosPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
