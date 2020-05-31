import { Chord } from './note';
import { Scale } from './scale';
import { Rhythm } from '../rhythm/rhythm';
import { Value } from '../values/value';

/**
 * Expresses a rythm pattern, containing any number of `Note`s over any duration span.
 * Can be four sixteenth notes spanning a quarter, or a tuplet consisting of an eights and a sixteenth over 2 eights.
 *
 * - `notes`: an array of `Note`
 * - `span`: duration, consistent with `Note` duration.
 */
export class Music {
  // TODO: I guess this should be called MusicFragment
  public readonly notes: Chord[];
  public readonly rhythm: Rhythm;
  public readonly scale: Scale;

  constructor(notes: Chord[], rhythm: Rhythm, scale: Scale) {
    this.notes = notes;
    this.scale = scale;
    this.rhythm = rhythm;
  };
  static oneNoteRhythm(chord: Chord, value: Value, scale: Scale): Music {
    return new Music([chord], new Rhythm([value]), scale);
  };
}
