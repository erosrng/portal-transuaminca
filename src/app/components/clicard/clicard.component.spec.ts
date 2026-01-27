import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClicardComponent } from './clicard.component';

describe('ClicardComponent', () => {
  let component: ClicardComponent;
  let fixture: ComponentFixture<ClicardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClicardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClicardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
