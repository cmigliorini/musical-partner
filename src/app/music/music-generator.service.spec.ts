import { TestBed } from '@angular/core/testing';

import { MusicGeneratorService } from './music-generator.service';

describe('MusicGeneratorService', () => {
  let service: MusicGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
