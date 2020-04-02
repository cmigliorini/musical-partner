import { TestBed } from '@angular/core/testing';

import { ValueGeneratorService } from './value-generator.service';
import { ValueGeneratorSettings } from './value-generator-settings';
import { Value } from './value';
import { TimeSignature } from './time-signature';

describe('ValueGeneratorService', () => {
  let service: ValueGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValueGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should generate an array of quarter notes', () => {
    let vgSettings: ValueGeneratorSettings = new ValueGeneratorSettings();
    vgSettings.nbBeats = 3;
    vgSettings.allowedRhythms = [ValueGeneratorSettings.StandardRhythm.Quarter];
    vgSettings.timeSignature = new TimeSignature(6, Value.QUARTER);
    expect(service.generateRhythm(vgSettings)).toEqual([Value.QUARTER, Value.QUARTER, Value.QUARTER]);
  })
});
