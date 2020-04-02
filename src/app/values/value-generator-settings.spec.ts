import { ValueGeneratorSettings } from './value-generator-settings';

describe('ValueGeneratorSettings', () => {
  it('should create an instance', () => {
    expect(new ValueGeneratorSettings()).toBeTruthy();
  });

  it('list all values', () => {
    expect(ValueGeneratorSettings.getStandardRhythmValues()).toEqual([
      'Quarter',
      'Half',
      'HalfDotted',
      'Whole',
      'TwoEights',
      'EightDottedSixteenth',
      'QuarterDottedEight',
      'FourSixteenth'
    ]);
  });
  it('get an enum', ()=> {
    expect(ValueGeneratorSettings.getStandardRhythmValues().map(s => ValueGeneratorSettings.getStandardRhythm(s))).toBeTruthy();
  });
});
