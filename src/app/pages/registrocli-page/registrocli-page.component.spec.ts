import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrocliPageComponent } from './registrocli-page.component';

describe('RegistrocliPageComponent', () => {
  let component: RegistrocliPageComponent;
  let fixture: ComponentFixture<RegistrocliPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrocliPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrocliPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
