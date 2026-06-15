import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetirosPagesComponent } from './retiros-pages.component';

describe('RetirosPagesComponent', () => {
  let component: RetirosPagesComponent;
  let fixture: ComponentFixture<RetirosPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetirosPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetirosPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
