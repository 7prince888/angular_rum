import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplunkrumComponent } from './splunkrum.component';

describe('SplunkrumComponent', () => {
  let component: SplunkrumComponent;
  let fixture: ComponentFixture<SplunkrumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplunkrumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplunkrumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
