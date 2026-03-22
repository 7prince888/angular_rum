import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptToggleComponent } from './script-toggle.component';

describe('ScriptToggleComponent', () => {
  let component: ScriptToggleComponent;
  let fixture: ComponentFixture<ScriptToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScriptToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
