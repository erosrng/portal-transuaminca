import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiperfilPageComponent } from './miperfil-page.component';

describe('MiperfilPageComponent', () => {
  let component: MiperfilPageComponent;
  let fixture: ComponentFixture<MiperfilPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiperfilPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiperfilPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
