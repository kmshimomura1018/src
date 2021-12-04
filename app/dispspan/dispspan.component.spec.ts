import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispspanComponent } from './dispspan.component';

describe('DispspanComponent', () => {
  let component: DispspanComponent;
  let fixture: ComponentFixture<DispspanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispspanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispspanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
