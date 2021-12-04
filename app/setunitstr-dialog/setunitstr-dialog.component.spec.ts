import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetunitstrDialogComponent } from './setunitstr-dialog.component';

describe('SetunitstrDialogComponent', () => {
  let component: SetunitstrDialogComponent;
  let fixture: ComponentFixture<SetunitstrDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetunitstrDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetunitstrDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
