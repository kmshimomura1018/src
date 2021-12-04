import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetdatanameDialogComponent } from './setdataname-dialog.component';

describe('SetdatanameDialogComponent', () => {
  let component: SetdatanameDialogComponent;
  let fixture: ComponentFixture<SetdatanameDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetdatanameDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetdatanameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
