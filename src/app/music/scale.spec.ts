import { Scale } from './scale';
import { ScaleNote } from '../scale-notes/scale-note';
import { Mode } from '../scale-notes/mode.enum';
import { Alteration } from '../scale-notes/alteration.enum';
import { Pitch } from '../models/pitch';

describe('Scale', () => {
  it('should create an instance with a first octave scalenote', () => {
    expect(new Scale(new ScaleNote(0, null), Mode.Major)).toBeTruthy();
  });
  it('should create an instance with a high octave scalenote', () => {
    expect(new Scale(new ScaleNote(60, null), Mode.Major)).toBeTruthy();
  });
  it('should handle a C Major', () => {
    const scaleCMajor: Scale = new Scale(new ScaleNote(0, null), Mode.Major);
    expect(scaleCMajor.toPitch(new ScaleNote(0, Alteration.Sharp)).key).toBe(1);
    expect(scaleCMajor.toPitch(new ScaleNote(6, null)).key).toBe(11);
    expect(scaleCMajor.toPitch(new ScaleNote(6 + 4 * 7, null)).key).toBe(11 + 4 * 12);
  });
  it('should handle a D flat minor', () => {
    const scaleDflatMinor: Scale = new Scale(new ScaleNote(1, Alteration.Flat), Mode.Minor);
    // Dflat +1 => 1 tone above C
    expect(scaleDflatMinor.toPitch(new ScaleNote(0, Alteration.Sharp)).key).toBe(2);
    // 7th degree, minor scale, is C
    expect(scaleDflatMinor.toPitch(new ScaleNote(6, null)).key).toBe(12);
    // 7th degree, minor scale, is C even at 5th octave
    expect(scaleDflatMinor.toPitch(new ScaleNote(6 + 4 * 7, null)).key).toBe(12 + 4 * 12);
    // 3th degree, minor scale, is E -> "4 halftones"
    expect(scaleDflatMinor.toPitch(new ScaleNote(2, null)).key).toBe(4);
    // 3th degree, minor scale, is E -> "4 halftones" even at 5th octave
    expect(scaleDflatMinor.toPitch(new ScaleNote(2 + 4 * 7, null)).key).toBe(4 + 4 * 12);
  });
  it('should convert from pitch, C major', () => {
    const scaleCMajor:Scale = new Scale(new ScaleNote(0, null), Mode.Major);
    expect(scaleCMajor.fromPitch(new Pitch(12))).toEqual(new ScaleNote(7, null));
    expect(scaleCMajor.fromPitch(new Pitch(13))).toEqual(new ScaleNote(7, Alteration.Sharp));
    expect(scaleCMajor.fromPitch(new Pitch(14))).toEqual(new ScaleNote(8, null));
    expect(scaleCMajor.fromPitch(new Pitch(15))).toEqual(new ScaleNote(8, Alteration.Sharp));
    expect(scaleCMajor.fromPitch(new Pitch(16))).toEqual(new ScaleNote(9, null));
    expect(scaleCMajor.fromPitch(new Pitch(17))).toEqual(new ScaleNote(10, null));
    expect(scaleCMajor.fromPitch(new Pitch(18))).toEqual(new ScaleNote(10, Alteration.Sharp));
    expect(scaleCMajor.fromPitch(new Pitch(19))).toEqual(new ScaleNote(11, null));
    expect(scaleCMajor.fromPitch(new Pitch(20))).toEqual(new ScaleNote(11, Alteration.Sharp));
    expect(scaleCMajor.fromPitch(new Pitch(21))).toEqual(new ScaleNote(12, null));
    expect(scaleCMajor.fromPitch(new Pitch(22))).toEqual(new ScaleNote(12, Alteration.Sharp));
    expect(scaleCMajor.fromPitch(new Pitch(23))).toEqual(new ScaleNote(13, null));
    expect(scaleCMajor.fromPitch(new Pitch(24))).toEqual(new ScaleNote(14, null));
  });
  it('should convert from pitch, C minor', () => {
    const scaleCMinor:Scale = new Scale(new ScaleNote(0, null), Mode.Minor);
    expect(scaleCMinor.fromPitch(new Pitch(12))).toEqual(new ScaleNote(7, null));
    expect(scaleCMinor.fromPitch(new Pitch(13))).toEqual(new ScaleNote(7, Alteration.Sharp));
    expect(scaleCMinor.fromPitch(new Pitch(14))).toEqual(new ScaleNote(8, null));
    expect(scaleCMinor.fromPitch(new Pitch(15))).toEqual(new ScaleNote(9, null));
    expect(scaleCMinor.fromPitch(new Pitch(16))).toEqual(new ScaleNote(9, Alteration.Sharp));
    expect(scaleCMinor.fromPitch(new Pitch(17))).toEqual(new ScaleNote(10, null));
    expect(scaleCMinor.fromPitch(new Pitch(18))).toEqual(new ScaleNote(10, Alteration.Sharp));
    expect(scaleCMinor.fromPitch(new Pitch(19))).toEqual(new ScaleNote(11, null));
    expect(scaleCMinor.fromPitch(new Pitch(20))).toEqual(new ScaleNote(12, null));
    expect(scaleCMinor.fromPitch(new Pitch(21))).toEqual(new ScaleNote(12, Alteration.Sharp));
    expect(scaleCMinor.fromPitch(new Pitch(22))).toEqual(new ScaleNote(13, Alteration.Flat));
    expect(scaleCMinor.fromPitch(new Pitch(23))).toEqual(new ScaleNote(13, null));
    expect(scaleCMinor.fromPitch(new Pitch(24))).toEqual(new ScaleNote(14, null));
  });
  it('should convert from pitch, F major', () => {
    console.debug('*** should convert from pitch, F major');
    const scaleFMajor:Scale = new Scale(new ScaleNote(3, null), Mode.Major);
    expect(scaleFMajor.fromPitch(new Pitch(17))).toEqual(new ScaleNote(7, null));
    expect(scaleFMajor.fromPitch(new Pitch(18))).toEqual(new ScaleNote(7, Alteration.Sharp));
    expect(scaleFMajor.fromPitch(new Pitch(19))).toEqual(new ScaleNote(8, null));
    expect(scaleFMajor.fromPitch(new Pitch(20))).toEqual(new ScaleNote(8, Alteration.Sharp));
    expect(scaleFMajor.fromPitch(new Pitch(21))).toEqual(new ScaleNote(9, null));
    expect(scaleFMajor.fromPitch(new Pitch(22))).toEqual(new ScaleNote(10, null));
    expect(scaleFMajor.fromPitch(new Pitch(23))).toEqual(new ScaleNote(10, Alteration.Sharp));
    expect(scaleFMajor.fromPitch(new Pitch(24))).toEqual(new ScaleNote(11, null));
    expect(scaleFMajor.fromPitch(new Pitch(25))).toEqual(new ScaleNote(11, Alteration.Sharp));
    expect(scaleFMajor.fromPitch(new Pitch(26))).toEqual(new ScaleNote(12, null));
    expect(scaleFMajor.fromPitch(new Pitch(27))).toEqual(new ScaleNote(12, Alteration.Sharp));
    expect(scaleFMajor.fromPitch(new Pitch(28))).toEqual(new ScaleNote(13, null));
    expect(scaleFMajor.fromPitch(new Pitch(29))).toEqual(new ScaleNote(14, null));
  });
  it('should convert from pitch, G minor', () => {
    const scaleGMinor: Scale = new Scale(new ScaleNote(4, null), Mode.Minor);
    const g5Pitch = 7 + 5 * 12;
    const g5Scale = 5 * 7;
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 0))).toEqual(new ScaleNote(g5Scale + 0, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 1))).toEqual(new ScaleNote(g5Scale + 0, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 2))).toEqual(new ScaleNote(g5Scale + 1, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 3))).toEqual(new ScaleNote(g5Scale + 2, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 4))).toEqual(new ScaleNote(g5Scale + 2, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 5))).toEqual(new ScaleNote(g5Scale + 3, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 6))).toEqual(new ScaleNote(g5Scale + 3, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 7))).toEqual(new ScaleNote(g5Scale + 4, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 8))).toEqual(new ScaleNote(g5Scale + 5, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 9))).toEqual(new ScaleNote(g5Scale + 5, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 10))).toEqual(new ScaleNote(g5Scale + 6, Alteration.Flat));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 11))).toEqual(new ScaleNote(g5Scale + 6, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 12))).toEqual(new ScaleNote(g5Scale + 7, null));
  });
  it('should convert from pitch, G flat minor', () => {
    const scaleGMinor: Scale = new Scale(new ScaleNote(4, Alteration.Flat), Mode.Minor);
    const g5Pitch = 6 + 5 * 12;
    const g5Scale = 5 * 7;
    console.debug('*** should convert from pitch, G flat minor');
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 0))).toEqual(new ScaleNote(g5Scale + 0, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 1))).toEqual(new ScaleNote(g5Scale + 0, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 2))).toEqual(new ScaleNote(g5Scale + 1, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 3))).toEqual(new ScaleNote(g5Scale + 2, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 4))).toEqual(new ScaleNote(g5Scale + 2, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 5))).toEqual(new ScaleNote(g5Scale + 3, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 6))).toEqual(new ScaleNote(g5Scale + 3, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 7))).toEqual(new ScaleNote(g5Scale + 4, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 8))).toEqual(new ScaleNote(g5Scale + 5, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 9))).toEqual(new ScaleNote(g5Scale + 5, Alteration.Sharp));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 10))).toEqual(new ScaleNote(g5Scale + 6, Alteration.Flat));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 11))).toEqual(new ScaleNote(g5Scale + 6, null));
    expect(scaleGMinor.fromPitch(new Pitch(g5Pitch + 12))).toEqual(new ScaleNote(g5Scale + 7, null));
  });
});
