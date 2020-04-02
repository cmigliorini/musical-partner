import { ScaleNote } from './scale-note';
import { Alteration } from './alteration.enum';

describe('ScaleNote', () => {
  it('should create an instance', () => {
    expect(new ScaleNote(0, Alteration.Flat)).toBeTruthy();
  });
});
