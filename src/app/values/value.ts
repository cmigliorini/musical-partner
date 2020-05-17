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
  readonly isRest: boolean = false;
  static readonly WHOLE_REST = new Value(Value.WHOLE_TICKS, true);
  static readonly HALF_REST = new Value(Value.WHOLE_TICKS / 2, true);
  static readonly HALF_DOTTED_REST = new Value(Value.WHOLE_TICKS / 4 * 3, true);
  static readonly QUARTER_REST = new Value(Value.WHOLE_TICKS / 4, true);
  static readonly QUARTER_DOTTED_REST = new Value(Value.WHOLE_TICKS / 8 * 3, true);
  static readonly EIGHTH_REST = new Value(Value.WHOLE_TICKS / 8, true);
  static readonly EIGHTH_DOTTED_REST = new Value(Value.WHOLE_TICKS / 16 * 3, true);
  static readonly SIXTEENTH_REST = new Value(Value.WHOLE_TICKS / 16, true);
  static readonly SIXTEENTH_DOTTED_REST = new Value(Value.WHOLE_TICKS / 32 * 3, true);
  static readonly THIRTYSECONDTH_REST = new Value(Value.WHOLE_TICKS / 32, true);
  static readonly THIRTYSECONDTH_DOTTED_REST = new Value(Value.WHOLE_TICKS / 4 * 3, true);
  static readonly SIXTYFOURTH_REST = new Value(Value.WHOLE_TICKS / 64, true);
  constructor(ticks: number, isRest ?: boolean) {
    this.ticks = ticks;
    if (isRest) {
      this.isRest = isRest;
    }
  }

}
