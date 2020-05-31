import { Value } from '../values/value';
import { ScaleNote } from '../scale-notes/scale-note';

/** Abstraction for a single note, chord, or rest.
 * @member `chord`: array of `ScaleNote`
 * @member `value`: associated `Value`
 */
export class Chord {
  readonly notes: ScaleNote[];
  constructor(notes: ScaleNote[]) {
    this.notes = notes;
  }

  /**
   * Builds a single note `Note` (yeah, I know)
   * @param scaleNote
   * @param value
   */
  static singleNoteChord(scaleNote: ScaleNote) {
    return new Chord([scaleNote]);
  }
}
