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
  it('should not fail if first and/or last notes are rests', () => {
    let mySettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    mySettings.scale = new Scale(new ScaleNote(0, null), Mode.Minor);
    mySettings.nbAccidentals = 0;
    mySettings.lowestPitch = mySettings.scale.toPitch(new ScaleNote(40, null));
    mySettings.highestPitch = mySettings.scale.toPitch(new ScaleNote(72, null));
    mySettings.maxInterval = 5;
    let scaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(mySettings).generateScaleNotes([new Rhythm([Value.QUARTER, Value.QUARTER_REST])]);
    expect(scaleNotes).toHaveSize(2);
    expect(scaleNotes[1]).not.toBeNull();
    scaleNotes = new ScaleNoteGeneratorService(mySettings).generateScaleNotes([new Rhythm([Value.QUARTER_REST, Value.QUARTER])]);
    expect(scaleNotes).toHaveSize(2);
    expect(scaleNotes[0]).not.toBeNull();
    scaleNotes = new ScaleNoteGeneratorService(mySettings).generateScaleNotes([new Rhythm([Value.QUARTER_REST, Value.QUARTER, Value.QUARTER_REST])]);
    expect(scaleNotes).toHaveSize(3);
    expect(scaleNotes[0]).not.toBeNull();
    expect(scaleNotes[1]).not.toBeNull();
    expect(scaleNotes[2]).not.toBeNull();
    // Should also return valid ScaleNotes if we have all rests 
    scaleNotes = new ScaleNoteGeneratorService(mySettings).generateScaleNotes([new Rhythm([Value.QUARTER_REST, Value.QUARTER_REST, Value.QUARTER_REST,
    Value.QUARTER_REST, Value.QUARTER_REST, Value.QUARTER_REST])]);
    expect(scaleNotes).toHaveSize(6);
    expect(scaleNotes.filter(v => v === null || v === undefined).length).toEqual(0);
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
    for (let interval of Array.from(Array(12).keys()).map(x => x)) {
      mySettings.maxInterval = interval;
      let scaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(mySettings).generateScaleNotes(rhythm);
      const nbValues = rhythm.map((r) => r.values.length).reduce((l1, l2) => l1 + l2);
      expect(scaleNotes.filter((note) => note !== null).length).toEqual(scaleNotes.length);
      expect(scaleNotes.filter((note) => note !== null).length).toEqual(nbValues);
      const firstNotes = scaleNotes.slice(0, -1);
      const secondNotes = scaleNotes.slice(1);
      let maxInterval: number = firstNotes.map((a, i) => Math.abs(a.degree - secondNotes[i].degree)).reduce((a, b) => Math.max(a, b), 0);
      expect(maxInterval).toBeLessThanOrEqual(maxInterval);
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

  it('should get a tonic and a lower leading tone', () => {
    let myTonicSettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    myTonicSettings.scale = new Scale(new ScaleNote(0, null), Mode.Major);
    // highestNote and lowestNote are interpreted in C scale
    myTonicSettings.maxInterval = 1;

    let tonicRhythm = [new Rhythm([Value.QUARTER, Value.QUARTER])];
    const cMajorScale = new Scale(new ScaleNote(0, null), Mode.Major);
    // Major
    for (let pitchTonic of Array.from(Array(70).keys()).map(x => x + 12)) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Major);
      myTonicSettings.lowestPitch = new Pitch(pitchTonic - 2);
      myTonicSettings.highestPitch = new Pitch(pitchTonic + 9);
      let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
      expect(iscaleNotes).toHaveSize(2);
      // degree is interpreted in requested scale, so tonic is always going to be first degree
      expect(iscaleNotes[1].degree % 7).toEqual(0);
      expect(iscaleNotes[0].degree).toEqual(iscaleNotes[1].degree - 1);
      if (iscaleNotes[0].degree !== iscaleNotes[1].degree - 1) console.debug(myTonicSettings.lowestPitch,
        myTonicSettings.highestPitch, myTonicSettings.scale.toPitch(iscaleNotes[1]), iscaleNotes);
    }
    // Minor
    for (let pitchTonic of Array.from(Array(70).keys()).map(x => x + 12)) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Minor);
      myTonicSettings.lowestPitch = new Pitch(pitchTonic - 2);
      myTonicSettings.highestPitch = new Pitch(pitchTonic + 9);
      let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
      expect(iscaleNotes).toHaveSize(2);
      // degree is interpreted in requested scale, so tonic is always going to be first degree
      expect(iscaleNotes[1].degree % 7).toEqual(0);
      expect(iscaleNotes[0].degree).toEqual(iscaleNotes[1].degree - 1);
    }
  });
  it('should get a tonic and a lower dominant', () => {
    let myTonicSettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    myTonicSettings.scale = new Scale(new ScaleNote(0, null), Mode.Major);

    myTonicSettings.maxInterval = 3;

    let tonicRhythm = [new Rhythm([Value.QUARTER, Value.QUARTER])];
    const cMajorScale = new Scale(new ScaleNote(0, null), Mode.Major);
    // Major
    for (let pitchTonic of Array.from(Array(70).keys()).map(x => x + 12)) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Major);
      myTonicSettings.lowestPitch = new Pitch(pitchTonic - 5);
      myTonicSettings.highestPitch = new Pitch(pitchTonic + 7);
      let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
      expect(iscaleNotes).toHaveSize(2);
      // degree is interpreted in requested scale, so tonic is always going to be first degree
      expect(iscaleNotes[1].degree % 7).toEqual(0);
      expect(iscaleNotes[0].degree).toEqual(iscaleNotes[1].degree - 3);
      if (iscaleNotes[0].degree !== iscaleNotes[1].degree - 3) console.debug(myTonicSettings.lowestPitch,
        myTonicSettings.highestPitch, myTonicSettings.scale.toPitch(iscaleNotes[1]), iscaleNotes);
    }
    // Minor
    for (let pitchTonic of Array.from(Array(70).keys()).map(x => x + 12)) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Minor);
      myTonicSettings.lowestPitch = new Pitch(pitchTonic - 5);
      myTonicSettings.highestPitch = new Pitch(pitchTonic + 7);
      let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
      expect(iscaleNotes).toHaveSize(2);
      // degree is interpreted in requested scale, so tonic is always going to be first degree
      expect(iscaleNotes[1].degree % 7).toEqual(0);
      expect(iscaleNotes[0].degree).toEqual(iscaleNotes[1].degree - 3);
      if (iscaleNotes[0].degree !== iscaleNotes[1].degree - 3) console.debug(myTonicSettings.lowestPitch,
        myTonicSettings.highestPitch, myTonicSettings.scale.toPitch(iscaleNotes[1]), iscaleNotes);
    }
  });
  it('should get a tonic and an upper dominant', () => {
    let myTonicSettings: ScaleNoteGeneratorSettings = new ScaleNoteGeneratorSettings();
    myTonicSettings.scale = new Scale(new ScaleNote(0, null), Mode.Major);

    myTonicSettings.maxInterval = 4;

    let tonicRhythm = [new Rhythm([Value.QUARTER, Value.QUARTER])];
    const cMajorScale = new Scale(new ScaleNote(0, null), Mode.Major);
    // Major
    for (let pitchTonic of Array.from(Array(70).keys()).map(x => x + 12)) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Major);
      myTonicSettings.lowestPitch = new Pitch(pitchTonic);
      myTonicSettings.highestPitch = new Pitch(pitchTonic + 11);
      let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
      expect(iscaleNotes).toHaveSize(2);
      // degree is interpreted in requested scale, so tonic is always going to be first degree
      expect(iscaleNotes[1].degree % 7).toEqual(0);
      expect(iscaleNotes[0].degree).toEqual(iscaleNotes[1].degree + 4);
      if (iscaleNotes[0].degree !== iscaleNotes[1].degree + 4) console.debug(myTonicSettings.lowestPitch,
        myTonicSettings.highestPitch, myTonicSettings.scale.toPitch(iscaleNotes[1]), iscaleNotes);
    }
    // Minor
    for (let pitchTonic of Array.from(Array(70).keys()).map(x => x + 12)) {
      myTonicSettings.scale = new Scale(cMajorScale.fromPitch(new Pitch(pitchTonic)), Mode.Minor);
      myTonicSettings.lowestPitch = new Pitch(pitchTonic);
      myTonicSettings.highestPitch = new Pitch(pitchTonic + 11);
      let iscaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(myTonicSettings).generateScaleNotes(tonicRhythm);
      expect(iscaleNotes).toHaveSize(2);
      // degree is interpreted in requested scale, so tonic is always going to be first degree
      expect(iscaleNotes[1].degree % 7).toEqual(0);
      expect(iscaleNotes[0].degree).toEqual(iscaleNotes[1].degree + 4);
      if (iscaleNotes[0].degree !== iscaleNotes[1].degree + 4) console.debug(myTonicSettings.lowestPitch,
        myTonicSettings.highestPitch, myTonicSettings.scale.toPitch(iscaleNotes[1]), iscaleNotes);
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
      expect(iscaleNotes[0].degree % 7).not.toEqual(0);
    }
  });
});
function testMinMaxDegreeInterval(mySettings: ScaleNoteGeneratorSettings, rhythm: Rhythm[]) {
  let scaleNotes: ScaleNote[] = new ScaleNoteGeneratorService(mySettings).generateScaleNotes(rhythm);
  let degrees: number[] = scaleNotes.map(a => a.degree);
  let maxDegree: number = degrees.reduce((a, b) => Math.max(a, b), 0);
  expect(maxDegree).toBeLessThanOrEqual(mySettings.scale.fromPitch(mySettings.highestPitch).degree);
  let minDegree: number = degrees.reduce((a, b) => Math.min(a, b), 1000);
  expect(minDegree).toBeGreaterThanOrEqual(mySettings.scale.fromPitch(mySettings.lowestPitch).degree);
  let intervals: number[] = degrees.map((_a, i, _scaleNotes) => i == 0 ? 0 : (degrees[i] - degrees[i - 1])).slice(1, degrees.length);
  let maxInterval: number = intervals.reduce((a, b) => Math.max(a, b), 0);
  expect(maxInterval).toBeLessThanOrEqual(mySettings.maxInterval);
  // Compute intervals frequencies for maxInterval=1
  let frequencies: number[] = [];
  intervals.forEach(int => frequencies[int + mySettings.maxInterval] ? frequencies[int + mySettings.maxInterval] += 1 : frequencies[int + mySettings.maxInterval] = 1);
}

