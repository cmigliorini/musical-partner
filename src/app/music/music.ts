import { Note } from './note';
import { Scale } from './scale';

/**
 * Expresses a rythm pattern, containing any number of `Note`s over any duration span.
 * Can be four sixteenth notes spanning a quarter, or a tuplet consisting of an eights and a sixteenth over 2 eights.
 *
 * - `notes`: an array of `Note`
 * - `span`: duration, consistent with `Note` duration.
 */
export class Music {
  private readonly notes: Note[];
  private scale: Scale;
  private span: number;

  constructor(notes: Note[], scale:Scale) {
    this.notes = notes;
    this.span = notes.map(n => n.value.ticks).reduce((a, b) => a + b, 0);
    this.scale = scale;
  };
  static oneNoteRhythm(note: Note, scale:Scale): Music {
    return new Music([note], scale);
  };

  public getNotes(): Note[] {
    return this.notes;
  }

  public getScale(): Scale {
    return this.scale;
  }
  /**
   * getSpan
   * @return total number of ticks for this music
   */
  public getSpan(): number {
    return this.span;
  }
}
