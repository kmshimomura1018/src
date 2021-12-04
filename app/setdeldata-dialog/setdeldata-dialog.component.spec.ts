import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetdeldataDialogComponent } from './setdeldata-dialog.component';

describe('SetdeldataDialogComponent', () => {
  let component: SetdeldataDialogComponent;
  let fixture: ComponentFixture<SetdeldataDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetdeldataDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetdeldataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
