import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplunkRumToggleComponent } from './splunk-rum-toggle.component';

describe('SplunkRumToggleComponent', () => {
  let component: SplunkRumToggleComponent;
  let fixture: ComponentFixture<SplunkRumToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplunkRumToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplunkRumToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
