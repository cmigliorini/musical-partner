import { tick } from '@angular/core/testing';

export class Value {
  static readonly WHOLE_TICKS = 16384;
  static readonly WHOLE = new Value(Value.WHOLE_TICKS);
  static readonly HALF = new Value(Value.WHOLE_TICKS / 2);
  static readonly HALF_DOTTED = new Value(Value.WHOLE_TICKS / 4 * 3);
  static readonly QUARTER = new Value(Value.WHOLE_TICKS / 4);
  static readonly QUARTER_DOTTED = new Value(Value.WHOLE_TICKS / 8 * 3);
  static readonly EIGHTH = new Value(Value.WHOLE_TICKS / 8);
  static readonly EIGHTH_DOTTED = new Value(Value.WHOLE_TICKS / 16 * 3);
  static readonly SIXTEENTH = new Value(Value.WHOLE_TICKS / 16);
  static readonly SIXTEENTH_DOTTED = new Value(Value.WHOLE_TICKS / 32 * 3);
  static readonly THIRTYSECONDTH = new Value(Value.WHOLE_TICKS / 32);
  static readonly THIRTYSECONDTH_DOTTED = new Value(Value.WHOLE_TICKS / 4 * 3);
  static readonly SIXTYFOURTH = new Value(Value.WHOLE_TICKS / 64);
  readonly ticks: number;

  constructor(ticks: number) {
    this.ticks = ticks;
  }
}
