import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetmonitorsettingsDialogComponent } from './setmonitorsettings-dialog.component';

describe('SetmonitorsettingsDialogComponent', () => {
  let component: SetmonitorsettingsDialogComponent;
  let fixture: ComponentFixture<SetmonitorsettingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetmonitorsettingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetmonitorsettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
