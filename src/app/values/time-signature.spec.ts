import { TimeSignature } from './time-signature';
import { Value } from './value';

describe('TimeSignature', () => {
  it('should create an instance', () => {
    expect(new TimeSignature(1, Value.QUARTER)).toBeTruthy();
  });
});
