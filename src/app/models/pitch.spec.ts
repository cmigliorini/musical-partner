import { Pitch } from './pitch';

describe('Pitch', () => {
  it('shouldcreate an instance', () => {
    expect(new Pitch(0)).toBeTruthy();
  });
  it('should create a valid pitch from string and octave', () => {
    expect(Pitch.toNumericKey('C', 4)).toBe(60);
    expect(Pitch.toNumericKey('c', 4)).toBe(60);
    expect(Pitch.toNumericKey('C#', 4)).toBe(61);
    expect(Pitch.toNumericKey('c#', 4)).toBe(61);
    expect(Pitch.toNumericKey('db', 4)).toBe(61);
    expect(Pitch.toNumericKey('DB', 4)).toBe(61);
  });
});

