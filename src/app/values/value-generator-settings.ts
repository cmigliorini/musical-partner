import { Value } from './value';
import { TimeSignature } from './time-signature';

export class ValueGeneratorSettings {
  private static readonly standardRythms: Value[][] = [
    [Value.QUARTER],
    [Value.HALF],
    [Value.HALF_DOTTED],
    [Value.WHOLE],
    [Value.EIGHTH, Value.EIGHTH],
    [Value.EIGHTH_DOTTED, Value.SIXTEENTH],
    [Value.QUARTER_DOTTED, Value.EIGHTH],
    [Value.SIXTEENTH, Value.SIXTEENTH, Value.SIXTEENTH, Value.SIXTEENTH]
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
  public static getRhythm(rhythm: ValueGeneratorSettings.StandardRhythm): Value[] {
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
    FourSixteenth
  }
  export function getStandardRhythmValues(): string[] {
    return Object.keys(StandardRhythm).map(key => StandardRhythm[key]).filter(value => typeof value === 'string');
  }
  export function getStandardRhythm(s: string): StandardRhythm {
    return StandardRhythm[s];
  }
}
