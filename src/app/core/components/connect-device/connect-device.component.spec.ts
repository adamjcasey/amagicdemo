import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConnectDeviceComponent } from '@app/core';

describe('ConnectDeviceComponent', () => {
  let component: ConnectDeviceComponent;
  let fixture: ComponentFixture<ConnectDeviceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ConnectDeviceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
