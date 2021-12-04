import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetcolorDialogComponent } from './setcolor-dialog.component';

describe('SetcolorDialogComponent', () => {
  let component: SetcolorDialogComponent;
  let fixture: ComponentFixture<SetcolorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetcolorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetcolorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
