import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetadjustdataDialogComponent } from './setadjustdata-dialog.component';

describe('SetadjustdataDialogComponent', () => {
  let component: SetadjustdataDialogComponent;
  let fixture: ComponentFixture<SetadjustdataDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetadjustdataDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetadjustdataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
