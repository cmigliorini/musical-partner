import { ScaleNote } from '../scale-notes/scale-note';
import { Pitch } from '../models/pitch';
import { Mode } from '../scale-notes/mode.enum';

/**
 * represents a scale, like C Sharp minor for instance.
 * @member `fundamental` will correspond to fundamental tone expressed in C Major scale
 * @member `mode` will be one of supported modes (currently mjor, minor)
 * @member `scale` describes number of half tones from fundamental for each of the 7 degrees
 */
export class Scale {
  readonly fundamental: ScaleNote;
  readonly mode: Mode;
  readonly scale: number[];
  readonly fundamentalPitch: number;
  private static readonly majorScale: number[] = [0, 2, 4, 5, 7, 9, 11];
  private static readonly minorScale: number[] = [0, 2, 3, 5, 7, 8, 11];

  /**
   * builds a scale based on `basePitch`,
   * @param basePitch
   * @param scale
   */
  constructor(basePitch: ScaleNote, mode: Mode) {
    this.fundamental = new ScaleNote(basePitch.degree % 7, basePitch.alteration);
    this.fundamentalPitch = Scale.majorScale[this.fundamental.degree] + (basePitch.alteration ? basePitch.alteration : 0);
    switch (mode) {
      case Mode.Major:
        this.scale = Scale.majorScale;
        break;
      case Mode.Minor:
        this.scale = Scale.minorScale;
        break;
      default:
        throw 'unsupported mode: ' + mode;
    }
    this.mode = mode;
  }
  /**
   * toPitch
   */
  public toPitch(scaleNote: ScaleNote): Pitch {
    // determine octave
    const octave: number = Math.floor(scaleNote.degree /7);
    // alteration
    const alteration: number = (scaleNote.alteration != null ? scaleNote.alteration : 0);
    const pitch = this.fundamentalPitch + 12 * octave + this.scale[scaleNote.degree % 7] + alteration;
    //console.log('degree=' + scaleNote.degree + ', alteration=' + alteration + ', pitch=' + pitch)
    return new Pitch(pitch);
  }
  public fromPitch(pitch: Pitch) : ScaleNote {
    const octave: number = Math.floor((pitch.key - this.fundamentalPitch) / 12);
    const relativePitch:number = pitch.key - octave * 12 - this.fundamentalPitch;
    const basePitch: number = this.scale.filter((a) => a <= relativePitch).reduce((oldMax, current) => Math.max(oldMax, current), 0);
    let degree: number = this.scale.indexOf(basePitch);
    let alteration: number = relativePitch - this.scale[degree] || null;
    if (alteration > 1) {
      // TODO: this fixes the "minor" mode issue on 7th degree, but should probably be handled differently
      degree += 1;
      alteration = -1;
      // console.debug("minor mode hack")
    }
    // console.debug("pitch:", pitch, "relative pitch:", relativePitch, "octave:", octave, "baseDegree:", basePitch, "degree:", degree, "alteration:", alteration);
    return new ScaleNote(degree + 7 * octave, alteration);
  }
}
