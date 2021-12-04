import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispspanDialogComponent } from './dispspan-dialog.component';

describe('DispspanDialogComponent', () => {
  let component: DispspanDialogComponent;
  let fixture: ComponentFixture<DispspanDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispspanDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispspanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
