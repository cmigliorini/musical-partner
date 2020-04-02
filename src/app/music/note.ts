import { Value } from '../values/value';
import { ScaleNote } from '../scale-notes/scale-note';

/** Abstraction for a single note, chord, or rest.
 * @member `chord`: array of `ScaleNote`
 * @member `value`: associated `Value`
 */
export class Note {
  readonly chord: ScaleNote[];
  readonly value: Value;
  constructor(chord: ScaleNote[], value: Value) {
    this.chord = chord;
    this.value = value;
  }

  /**
   * Builds a single note `Note` (yeah, I know)
   * @param scaleNote
   * @param value
   */
  static singleNote(scaleNote: ScaleNote, value: Value) {
    return new Note([scaleNote], value);
  }

}
