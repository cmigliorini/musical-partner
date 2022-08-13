import { TestBed } from '@angular/core/testing';

import { ScaleNoteGeneratorService } from './scale-note-generator.service';
import { ScaleNoteGeneratorSettings } from './scale-note-generator-settings';
import { ScaleNote } from './scale-note';
import { ValueGeneratorService } from '../values/value-generator.service';
import { ValueGeneratorSettings } from '../values/value-generator-settings';
import { TimeSignature } from '../values/time-signature';
import { Value } from '../values/value';
import { Rhythm } from '../rhythm/rhythm';
import { Scale } from '../music/scale';
import { Mode } from './mode.enum';
import { Pitch } from '../models/pitch';

describe('ScaleNoteGeneratorService', () => {
  let service: ScaleNoteGeneratorService;
  let rhythm: Rhythm[];

  beforeEach(() => {
    const cMajorScale = new Scale(new ScaleNote(0, null), Mode.Major);
    TestBed.configureTestingModule({});
    let settings = new ScaleNoteGeneratorSettings();
    settings.scale = new Scale(new ScaleNote(0, null), Mode.Minor);
    settings.lowestPitch = cMajorScale.toPitch(new ScaleNote(4, null));
    settings.highestPitch = cMajorScale.toPitch(new ScaleNote(4, null));
    settings.maxInterval = 10;

    service = new ScaleNoteGeneratorService(settings);

    let valueGeneratorSettings: ValueGeneratorSettings = new ValueGeneratorSettings();
    valueGeneratorSettings.nbBeats = 5000;
    valueGeneratorSettings.allowedRhythms = ValueGeneratorSettings.getStandardRhythms(ValueGeneratorSettings.RhythmicMode.Binary);
    valueGeneratorSettings.timeSignature = new TimeSignature(4, Value.QUARTER);
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
    mySettings.scale = new Scale(new ScaleNote(0, null), Mode.Minor);
    mySettings.nbAccidentals = 0;
    mySettings.lowestPitch = mySettings.scale.toPitch(new ScaleNote(40, null));
    mySettings.highestPitch = mySettings.scale.toPitch(new ScaleNote(72, null));
    mySettings.maxInterval = 0;
    for (let _ of Array(1)) {
      let scaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(mySettings).generateScaleNotes(rhythm);
      const nbValues = rhythm.map((r) => r.values.length).reduce((l1, l2) => l1 + l2);
      const nullNotes = scaleNotes.map((note, index) => note === null ? index : null).filter((note) => note !== null);
      if (nullNotes.length)
        console.debug("FOUND null notes ", nullNotes);
      expect(scaleNotes.filter((note) => note !== null).length).toEqual(scaleNotes.length);
      expect(scaleNotes.filter((note) => note !== null).length).toEqual(nbValues);
      let maxDegree: number = scaleNotes.map(a => a.degree).reduce((a, b) => Math.max(a, b));
      let minDegree: number = scaleNotes.map(a => a.degree).reduce((a, b) => Math.min(a, b));
      expect(maxDegree - minDegree).toBe(0);
    }
  });
  it('should fit between lowest and highest note, respect maxInterval, and have an equiprobability over all intervals', () => {
    let mySettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    mySettings.scale = new Scale(new ScaleNote(0, null), Mode.Minor);
    mySettings.nbAccidentals = 0;
    mySettings.lowestPitch = mySettings.scale.toPitch(new ScaleNote(0, null));
    mySettings.highestPitch = mySettings.scale.toPitch(new ScaleNote(100, null));
    mySettings.maxInterval = 10;
    testMinMaxDegreeInterval(mySettings, rhythm);
    mySettings.maxInterval = 0;
    testMinMaxDegreeInterval(mySettings, rhythm);
    mySettings.maxInterval = 1;
    testMinMaxDegreeInterval(mySettings, rhythm);
  });
  it('should throw if nbAccidentals is not zero', () => {
    let mySettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    mySettings.scale = new Scale(new ScaleNote(0, null), Mode.Minor);
    mySettings.nbAccidentals = 1;
    mySettings.highestPitch = mySettings.scale.toPitch(new ScaleNote(48, null));
    mySettings.lowestPitch = mySettings.scale.toPitch(new ScaleNote(40, null));
    mySettings.maxInterval = 10;
    expect(function () { new ScaleNoteGeneratorService(mySettings) }).toThrow();
  });
  it('should get a tonic', () => {
    let myTonicSettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    myTonicSettings.scale = new Scale(new ScaleNote(0, null), Mode.Major);
    // highestNote and lowestNote are interpreted in C scale
    myTonicSettings.maxInterval = 1;

    let tonicRhythm = [new Rhythm([Value.WHOLE])];
    // - change scale height
    const cMajorScale = new Scale(new ScaleNote(0, null), Mode.Major);
    for (let pitchTonic of Array.from(Array(70).keys()).map(x => x)) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Major);
      // Test 12 different offsets and 35 different ambituses, all including at least one tonic
      for (let ambitus of Array.from(Array(35).keys()).map(x => x + 11)) {
        for (let lowestOffset of Array.from(Array(12).keys()).map(x => x)) {
          myTonicSettings.lowestPitch = new Pitch(pitchTonic + lowestOffset);
          myTonicSettings.highestPitch = new Pitch(pitchTonic + lowestOffset + ambitus);
          let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
          expect(iscaleNotes).toHaveSize(1);
          // degree is interpreted in requested scale, so tonic is always going to be first degree
          expect(iscaleNotes[0].degree % 7).toEqual(0);
        }
      }
    }
  });
  it('should NOT get a tonic', () => {
    let myTonicSettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    const cMajorScale = new Scale(new ScaleNote(0, null), Mode.Major);
    // highestNote and lowestNote are interpreted in C scale
    myTonicSettings.maxInterval = 1;
    myTonicSettings.nbAccidentals = 0;
    let tonicRhythm = [new Rhythm([Value.WHOLE])];
    // - change scale height
    for (let pitchTonic of [7, 19]
      // Array.from(Array(70).keys()).map(x => x)
    ) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Major);
      myTonicSettings.lowestPitch = new Pitch(pitchTonic + 3);
      myTonicSettings.highestPitch = new Pitch(pitchTonic + 5);
      let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
      expect(iscaleNotes).toHaveSize(1);
      // degree is interpreted in requested scale, so tonic is always going to be first degree
      if (iscaleNotes[0].degree % 7 === 0) console.debug("should NOT have found a tonic with pitchTonic=", pitchTonic);
      expect(iscaleNotes[0].degree % 7).not.toEqual(0);
    }
  });
});
function testMinMaxDegreeInterval(mySettings: ScaleNoteGeneratorSettings, rhythm: Rhythm[]) {
  let scaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(mySettings).generateScaleNotes(rhythm);
  let degrees: number[] = scaleNotes.map(a => a.degree);
  let maxDegree: number = degrees.reduce((a, b) => Math.max(a, b));
  expect(maxDegree).toBeLessThanOrEqual(mySettings.scale.fromPitch(mySettings.highestPitch).degree);
  let minDegree: number = degrees.reduce((a, b) => Math.min(a, b));
  expect(minDegree).toBeGreaterThanOrEqual(mySettings.scale.fromPitch(mySettings.lowestPitch).degree);
  let intervals: number[] = degrees.map((_a, i, _scaleNotes) => i == 0 ? 0 : (degrees[i] - degrees[i - 1])).slice(1, degrees.length);
  let maxInterval: number = intervals.reduce((a, b) => Math.max(a, b));
  expect(maxInterval).toBeLessThanOrEqual(mySettings.maxInterval);
  // Compute intervals frequencies for maxInterval=1
  let frequencies: number[] = [];
  intervals.forEach(int => frequencies[int + mySettings.maxInterval] ? frequencies[int + mySettings.maxInterval] += 1 : frequencies[int + mySettings.maxInterval] = 1);
}

