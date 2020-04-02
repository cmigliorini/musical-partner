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
  it('should handle a E flat minor', () => {
    const scaleBflatMinor: Scale = new Scale(new ScaleNote(1, Alteration.Flat), Mode.Minor);
    // Eflat +1 => E
    expect(scaleBflatMinor.toPitch(new ScaleNote(0, Alteration.Sharp)).key).toBe(2);
    // 7th degree, minor scale, is Cflat -> "B"
    expect(scaleBflatMinor.toPitch(new ScaleNote(6, null)).key).toBe(11);
    // 7th degree, minor scale, is Cflat -> "B" even at 4th octave
    expect(scaleBflatMinor.toPitch(new ScaleNote(6 + 4 * 7, null)).key).toBe(11 + 4 * 12);
  });
});
