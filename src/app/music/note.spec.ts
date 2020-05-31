import { Chord } from './note';
import { Value } from '../values/value';
import { ScaleNote } from '../scale-notes/scale-note';

describe('Note', () => {
  it('should create an instance', () => {
    expect(Chord.singleNoteChord(new ScaleNote(35, null))).toBeTruthy();
  });
});
