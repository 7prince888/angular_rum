import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplunkRumAdminComponent } from './splunk-rum-admin.component';

describe('SplunkRumAdminComponent', () => {
  let component: SplunkRumAdminComponent;
  let fixture: ComponentFixture<SplunkRumAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplunkRumAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplunkRumAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
