import { Value } from './value';

describe('Value', () => {
  it('should create an instance', () => {
    expect(new Value(4096)).toBeTruthy();
  });
});
