import { ScaleNote } from './scale-note';
import { Scale } from '../music/scale';

export class ScaleNoteGeneratorSettings {
  scale: Scale;
  // Must be interpreted in "absolute" scale, i.e. Scale(ScaleNote(0,null), Mode.Major)
  lowestNote: ScaleNote;
  // Must be interpreted in "absolute" scale, i.e. Scale(ScaleNote(0,null), Mode.Major)
  highestNote: ScaleNote;
  // Expressed in degrees
  maxInterval: number;
  nbAccidentals: number;
}
