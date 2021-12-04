import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinegraphDialogComponent } from './combinegraph-dialog.component';

describe('CombinegraphDialogComponent', () => {
  let component: CombinegraphDialogComponent;
  let fixture: ComponentFixture<CombinegraphDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinegraphDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinegraphDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
