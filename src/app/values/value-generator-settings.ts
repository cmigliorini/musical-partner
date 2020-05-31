import { Value } from './value';
import { TimeSignature } from './time-signature';
import { Rhythm } from '../rhythm/rhythm';
import { Binary } from '@angular/compiler';

export class ValueGeneratorSettings {
  private static readonly standardRhythms: Rhythm[][] = [[
    new Rhythm([Value.QUARTER]),
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
  ], []];

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
        throw "unsupported rhythmic mode:" + rhythmicMode;
    }
  }
}

export namespace ValueGeneratorSettings {
  export enum RhythmicMode {
    Binary = 0,
    Ternary
  }
}
