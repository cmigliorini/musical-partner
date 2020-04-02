import { Note } from './note';
import { Value } from '../values/value';
import { ScaleNote } from '../scale-notes/scale-note';

describe('Note', () => {
  it('should create an instance', () => {
    expect(Note.singleNote(new ScaleNote(35, null), Value.QUARTER)).toBeTruthy();
  });
});
