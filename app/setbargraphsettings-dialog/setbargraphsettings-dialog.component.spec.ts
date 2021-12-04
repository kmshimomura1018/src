import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetbargraphsettingsDialogComponent } from './setbargraphsettings-dialog.component';

describe('SetbargraphsettingsDialogComponent', () => {
  let component: SetbargraphsettingsDialogComponent;
  let fixture: ComponentFixture<SetbargraphsettingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetbargraphsettingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetbargraphsettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
