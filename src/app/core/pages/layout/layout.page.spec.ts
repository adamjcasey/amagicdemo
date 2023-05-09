import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LayoutPage } from './layout.page';

describe('LayoutPage', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(LayoutPage);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
