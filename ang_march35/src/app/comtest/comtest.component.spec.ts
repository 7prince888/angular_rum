import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComtestComponent } from './comtest.component';

describe('ComtestComponent', () => {
  let component: ComtestComponent;
  let fixture: ComponentFixture<ComtestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComtestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComtestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
