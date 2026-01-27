import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamosPageComponent } from './reclamos-page.component';

describe('ReclamosPageComponent', () => {
  let component: ReclamosPageComponent;
  let fixture: ComponentFixture<ReclamosPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamosPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamosPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
