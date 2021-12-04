import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdkVirtualScrollFixedBufferComponent } from './cdk-virtual-scroll-fixed-buffer.component';

describe('CdkVirtualScrollFixedBufferComponent', () => {
  let component: CdkVirtualScrollFixedBufferComponent;
  let fixture: ComponentFixture<CdkVirtualScrollFixedBufferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdkVirtualScrollFixedBufferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdkVirtualScrollFixedBufferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
