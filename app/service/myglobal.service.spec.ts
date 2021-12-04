import { TestBed } from '@angular/core/testing';

import { MyglobalService } from './myglobal.service';

describe('MyglobalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MyglobalService = TestBed.get(MyglobalService);
    expect(service).toBeTruthy();
  });
});
