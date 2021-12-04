import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetdecimaldigitsDialogComponent } from './setdecimaldigits-dialog.component';

describe('SetdecimaldigitsDialogComponent', () => {
  let component: SetdecimaldigitsDialogComponent;
  let fixture: ComponentFixture<SetdecimaldigitsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetdecimaldigitsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetdecimaldigitsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
