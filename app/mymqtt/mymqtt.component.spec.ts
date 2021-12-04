import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MymqttComponent } from './mymqtt.component';

describe('MymqttComponent', () => {
  let component: MymqttComponent;
  let fixture: ComponentFixture<MymqttComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MymqttComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MymqttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
