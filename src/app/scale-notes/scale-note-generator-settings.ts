import { Scale } from '../music/scale';
import { Pitch } from '../models/pitch';

export class ScaleNoteGeneratorSettings {
  scale: Scale;
  lowestPitch: Pitch;
  highestPitch: Pitch;
  // Expressed in degrees
  maxInterval: number = 0;
  nbAccidentals: number = 0;
}
