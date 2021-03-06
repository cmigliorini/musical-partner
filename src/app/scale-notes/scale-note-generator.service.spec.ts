import { TestBed } from '@angular/core/testing';

import { ScaleNoteGeneratorService } from './scale-note-generator.service';
import { ScaleNoteGeneratorSettings } from './scale-note-generator-settings';
import { ScaleNote } from './scale-note';
import { ValueGeneratorService } from '../values/value-generator.service';
import { ValueGeneratorSettings } from '../values/value-generator-settings';
import { TimeSignature } from '../values/time-signature';
import { Value } from '../values/value';
import { Rhythm } from '../rhythm/rhythm';

describe('ScaleNoteGeneratorService', () => {
  let service: ScaleNoteGeneratorService;
  let rhythm: Rhythm[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    let settings = new ScaleNoteGeneratorSettings();
    settings.highestNote = new ScaleNote(4, null);
    settings.lowestNote = new ScaleNote(4, null);
    settings.maxInterval = 10;

    service = new ScaleNoteGeneratorService(settings);

    let valueGeneratorSettings: ValueGeneratorSettings = new ValueGeneratorSettings();
    valueGeneratorSettings.nbBeats=5000;
    valueGeneratorSettings.allowedRhythms = ValueGeneratorSettings.getStandardRhythms(ValueGeneratorSettings.RhythmicMode.Binary);
    valueGeneratorSettings.timeSignature= new TimeSignature(4, Value.QUARTER);
    rhythm = new ValueGeneratorService().generateRhythm(valueGeneratorSettings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should create a single note', () => {
    expect(service.generateScaleNotes([new Rhythm([Value.EIGHTH])])).toEqual([new ScaleNote(4, null)]);
    expect(service.generateScaleNotes([new Rhythm([Value.EIGHTH, Value.EIGHTH])])).toEqual([new ScaleNote(4, null), new ScaleNote(4, null)]);
  });
  it('should implement maxInterval', () => {
    let mySettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    mySettings.nbAccidentals = 0;
    mySettings.highestNote = new ScaleNote(40, null);
    mySettings.lowestNote = new ScaleNote(72, null);
    mySettings.maxInterval = 0;
    let scaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(mySettings).generateScaleNotes(rhythm);
    let maxDegree: number = scaleNotes.map(a => a.degree).reduce((a, b) => Math.max(a, b));
    let minDegree: number = scaleNotes.map(a => a.degree).reduce((a, b) => Math.min(a, b));
    expect(maxDegree - minDegree).toBe(0);
  });
  it('should fit between lowest and highest note, respect maxInterval, and have an equiprobability over all intervals', () => {
    let mySettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    mySettings.nbAccidentals = 0;
    mySettings.lowestNote = new ScaleNote(0, null);
    mySettings.highestNote = new ScaleNote(100, null);
    mySettings.maxInterval = 10;
    testMinMaxDegreeInterval(mySettings, rhythm);
    mySettings.maxInterval = 0;
    testMinMaxDegreeInterval(mySettings, rhythm);
    mySettings.maxInterval = 1;
    testMinMaxDegreeInterval(mySettings, rhythm);
  });
  it('should throw if nbAccidentals is not zero', () => {
    let mySettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    mySettings.nbAccidentals = 1;
    mySettings.highestNote = new ScaleNote(48, null);
    mySettings.lowestNote = new ScaleNote(40, null);
    mySettings.maxInterval = 10;
    expect(function () { new ScaleNoteGeneratorService(mySettings) }).toThrow();
  });
});
function testMinMaxDegreeInterval(mySettings: ScaleNoteGeneratorSettings, rhythm: Rhythm[]) {
  let scaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(mySettings).generateScaleNotes(rhythm);
  let degrees: number[] = scaleNotes.map(a => a.degree);
  let maxDegree: number = degrees.reduce((a, b) => Math.max(a, b));
  expect(maxDegree).toBeLessThanOrEqual(mySettings.highestNote.degree);
  let minDegree: number = degrees.reduce((a, b) => Math.min(a, b));
  expect(minDegree).toBeGreaterThanOrEqual(mySettings.lowestNote.degree);
  let intervals: number[] = degrees.map((a, i, scaleNotes) => i == 0 ? 0 : (degrees[i] - degrees[i - 1])).slice(1, degrees.length);
  let maxInterval: number = intervals.reduce((a, b) => Math.max(a, b));
  expect(maxInterval).toBeLessThanOrEqual(mySettings.maxInterval);
  // Compute intervals frequencies for maxInterval=1
  let frequencies: number[] = [];
  intervals.forEach(int => frequencies[int + mySettings.maxInterval] ? frequencies[int + mySettings.maxInterval] += 1 : frequencies[int + mySettings.maxInterval] = 1);
  console.debug('--- maxInterval=' + mySettings.maxInterval);
  console.debug(Object.keys(frequencies).map((i, f) => (Number(i) - mySettings.maxInterval).toString() + ': ' + frequencies[f]).join('\n'));
}

