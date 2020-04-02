import { Music } from './music';
import { Note } from './note';
import { Pitch } from '../models/pitch';
import { Value } from '../values/value';
import { ScaleNote } from '../scale-notes/scale-note';
import { Scale } from './scale';
import { Mode } from '../scale-notes/mode.enum';
describe('Rythm', () => {
  it('should create an instance from a single note', () => {
    expect(new Music([Note.singleNote(new ScaleNote(60, null), new Value(4096))], new Scale(new ScaleNote(0, null), Mode.Major))).toBeTruthy();
  });
  it('should create an instance from a single chord note (constructor)', () => {
    expect(new Music([new Note([new ScaleNote(60, null), new ScaleNote(60, null)], new Value(4096))], new Scale(new ScaleNote(0, null), Mode.Major))).toBeTruthy();
  });
  // it('should create an instance from a single chord note (alias)', () => {
  //   expect(Music.oneNoteRhythm(new ScaleNote(60,null)),  new Value(4096)))).toBeTruthy();
  // });
  // it('should create an instance from a two-chord note', () => {
  //   expect(new Music([new Note([new Pitch(60), new Pitch(61)],  new Value(6144)), new Note([new Pitch(60), new Pitch(61)], new Value(2048))])).toBeTruthy();
  // });
  // it('should compute proper span from given notes', () => {
  //   expect(new Music([new Note([new ScaleNote(60,null), new Pitch(61)],  new Value(6144)), new Note([new Pitch(60), new Pitch(61)], new Value(2048))]).getSpan()).toBe(8192);
  // });
  // TODO: test failures
});
