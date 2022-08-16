import { Pitch } from './pitch';

describe('Pitch', () => {
  it('should create an instance', () => {
    expect(new Pitch(0)).toBeTruthy();
  });
  it('should create a valid pitch from string and octave', () => {
    expect(Pitch.toNumericKey('C', 4)).toBe(48);
    expect(Pitch.toNumericKey('c', 4)).toBe(48);
    expect(Pitch.toNumericKey('C#', 4)).toBe(49);
    expect(Pitch.toNumericKey('c#', 4)).toBe(49);
    expect(Pitch.toNumericKey('db', 4)).toBe(49);
    expect(Pitch.toNumericKey('DB', 4)).toBe(49);
  });
});

