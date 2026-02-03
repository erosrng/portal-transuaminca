import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncomiendasPagesComponent } from './encomiendas-pages.component';

describe('EncomiendasPagesComponent', () => {
  let component: EncomiendasPagesComponent;
  let fixture: ComponentFixture<EncomiendasPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncomiendasPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncomiendasPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
