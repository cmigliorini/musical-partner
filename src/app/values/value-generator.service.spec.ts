import { TestBed } from '@angular/core/testing';

import { ValueGeneratorService } from './value-generator.service';
import { ValueGeneratorSettings } from './value-generator-settings';
import { Value } from './value';
import { TimeSignature } from './time-signature';
import { Rhythm } from '../rhythm/rhythm';

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
    vgSettings.allowedRhythms = [new Rhythm([Value.QUARTER])];
    vgSettings.timeSignature = new TimeSignature(6, Value.QUARTER);
    expect(service.generateRhythm(vgSettings)).toEqual([new Rhythm([Value.QUARTER]), new Rhythm([Value.QUARTER]), new Rhythm([Value.QUARTER])]);
  })
});
