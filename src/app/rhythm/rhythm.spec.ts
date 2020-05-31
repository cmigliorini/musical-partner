import { Rhythm } from './rhythm';
import { Value } from '../values/value';

describe('Rhythm', () => {
  it('should create an instance', () => {
    expect(new Rhythm([Value.QUARTER])).toBeTruthy();
  });
});
