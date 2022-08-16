import { Value } from './value';
import { TimeSignature } from './time-signature';
import { Rhythm } from '../rhythm/rhythm';

// *** Binaire
// quart de soupir trois doubles
// croche noire croche
// double, croche pointée
// croche triolet de doubles

export class ValueGeneratorSettings {
  private static readonly standardRhythms: Rhythm[][] = [[
    new Rhythm([Value.QUARTER]),
    new Rhythm([Value.QUARTER_REST]),
    new Rhythm([Value.HALF]),
    new Rhythm([Value.HALF_DOTTED]),
    new Rhythm([Value.WHOLE]),
    new Rhythm([Value.EIGHTH, Value.EIGHTH]),
    new Rhythm([Value.EIGHTH_DOTTED, Value.SIXTEENTH]),
    new Rhythm([Value.QUARTER_DOTTED, Value.EIGHTH]),
    new Rhythm([Value.SIXTEENTH, Value.SIXTEENTH, Value.SIXTEENTH, Value.SIXTEENTH]),
    new Rhythm([Value.EIGHTH, Value.SIXTEENTH, Value.SIXTEENTH]),
    new Rhythm([Value.SIXTEENTH, Value.SIXTEENTH, Value.EIGHTH]),
    new Rhythm([Value.SIXTEENTH, Value.EIGHTH, Value.SIXTEENTH]),
    new Rhythm([Value.EIGHTH_REST, Value.EIGHTH]),
    new Rhythm([Value.EIGHTH, Value.EIGHTH, Value.EIGHTH], Value.QUARTER.ticks),
    new Rhythm([Value.SIXTEENTH_REST, Value.SIXTEENTH, Value.SIXTEENTH, Value.SIXTEENTH,]),
    new Rhythm([Value.EIGHTH, Value.QUARTER, Value.EIGHTH]),
    new Rhythm([Value.SIXTEENTH, Value.EIGHTH_DOTTED]),
  ], [
    // ** Ternaire
    // croche noire
    // croche croche deux doubles
    // croche deux doubles, croche
    // deux doubles, deux croches
    // noire deux doubles
    // demi-soupir deux croches (et permutations)

    new Rhythm([Value.QUARTER_DOTTED]),
    new Rhythm([Value.QUARTER_DOTTED_REST]),
    new Rhythm([Value.QUARTER, Value.EIGHTH]),
    new Rhythm([Value.EIGHTH, Value.EIGHTH, Value.EIGHTH]),
    new Rhythm([Value.HALF_DOTTED]),
    new Rhythm(new Array<Value>(6).fill(Value.SIXTEENTH)),
    new Rhythm([Value.EIGHTH_DOTTED, Value.SIXTEENTH, Value.EIGHTH]),
    new Rhythm([Value.EIGHTH, Value.QUARTER]),
    new Rhythm([Value.EIGHTH, Value.EIGHTH, Value.SIXTEENTH, Value.SIXTEENTH]),
    new Rhythm([Value.EIGHTH, Value.SIXTEENTH, Value.SIXTEENTH, Value.EIGHTH]),
    new Rhythm([Value.SIXTEENTH, Value.SIXTEENTH, Value.EIGHTH, Value.EIGHTH]),
    new Rhythm([Value.QUARTER, Value.SIXTEENTH, Value.SIXTEENTH]),
    new Rhythm([Value.SIXTEENTH, Value.SIXTEENTH, Value.QUARTER]),
    new Rhythm([Value.EIGHTH_REST, Value.EIGHTH, Value.EIGHTH]),
    new Rhythm([Value.EIGHTH, Value.EIGHTH_REST, Value.EIGHTH]),
    new Rhythm([Value.EIGHTH, Value.EIGHTH, Value.EIGHTH_REST]),
  ]];

  // Rythm section
  mode: ValueGeneratorSettings.RhythmicMode;
  nbBeats: number;
  allowedRhythms: Rhythm[];
  timeSignature: TimeSignature;

  /**
   * getRhythm
   *
   * @returns a sequence of `Value`
   *
   */
  public static getRhythm(rhythmicMode: ValueGeneratorSettings.RhythmicMode, rhythm: number): Rhythm {
    return ValueGeneratorSettings.standardRhythms[rhythmicMode][rhythm];
  }


  public static getStandardRhythms(rhythmicMode: ValueGeneratorSettings.RhythmicMode): Rhythm[] {
    switch (rhythmicMode) {
      case ValueGeneratorSettings.RhythmicMode.Binary:
      case ValueGeneratorSettings.RhythmicMode.Ternary:
        return ValueGeneratorSettings.standardRhythms[rhythmicMode];
      default:
        throw new Error("unsupported rhythmic mode:" + rhythmicMode);
    }
  }
}

export namespace ValueGeneratorSettings {
  export enum RhythmicMode {
    Binary = 0,
    Ternary
  }
}
