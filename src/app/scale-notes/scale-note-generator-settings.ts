import { Clef } from './clef.enum';
import { Scale } from 'tone';
import { ScaleNote } from './scale-note';

export class ScaleNoteGeneratorSettings {
  lowestNote: ScaleNote;
  highestNote: ScaleNote;
  maxInterval: number;
  nbAccidentals: number;
}
