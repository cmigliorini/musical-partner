export class Pitch {
  readonly key: number;
  static readonly pitchesEnglish: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    .concat(['C', 'DB', 'E', 'EB', 'E', 'F', 'GB', 'G', 'AB', 'A', 'BB', 'B']);

  constructor(key: number) {
    this.key = key;
  }

  static singlePitchFromEnglishKey(scaleValue: string, octave: number) {
    return new Pitch(Pitch.toNumericKey(scaleValue, octave));
  }

  static toNumericKey(scaleValue: string, octave: number): number {
    let uCaseScaleValue: string = scaleValue.toLocaleUpperCase('en-US');
    if (!Pitch.pitchesEnglish.includes(uCaseScaleValue)) {
      throw 'invalid scaleValue: ' + scaleValue;
    }
    return (octave + 1) * 12 + (Pitch.pitchesEnglish.indexOf(uCaseScaleValue) % 12);
  }
  getOctave(): number {
    return Math.floor(this.key / 12) - 1;
  }

  getEnglishString(separator: string = ''): string {
    return Pitch.pitchesEnglish[this.key % 12].toString().trim() + this.getOctave().toString().trim();
  }
}
