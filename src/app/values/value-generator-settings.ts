import { Value } from './value';
import { TimeSignature } from './time-signature';
import { Rhythm } from '../rhythm/rhythm';

export class ValueGeneratorSettings {
  private static readonly standardRythms: Rhythm[] = [
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
  ];

  // Rythm section
  nbBeats: number;
  allowedRhythms: ValueGeneratorSettings.StandardRhythm[];
  timeSignature: TimeSignature;

  /**
   * getRhythm
   *
   * @returns a sequence of `Value`
   *
   */
  public static getRhythm(rhythm: ValueGeneratorSettings.StandardRhythm): Rhythm {
    return ValueGeneratorSettings.standardRythms[rhythm];
  }

}

export namespace ValueGeneratorSettings {
  export enum StandardRhythm {
    Quarter = 0,
    Half,
    HalfDotted,
    Whole,
    TwoEights,
    EightDottedSixteenth,
    QuarterDottedEight,
    FourSixteenth,
    EighthTwoSixteenths,
    TwoSixteenthsEighth,
    Syncopette,
    EighthRestEighth,
    Triplet,
  }
  export function getStandardRhythmValues(): string[] {
    return Object.keys(StandardRhythm).map(key => StandardRhythm[key]).filter(value => typeof value === 'string');
  }
  export function getStandardRhythm(s: string): StandardRhythm {
    return StandardRhythm[s];
  }
}
