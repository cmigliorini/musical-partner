import { Value } from './value';

export class TimeSignature {
  constructor(beatsPerMeasure: number, beat: Value) {
    this.beat = beat;
    this.beatsPerMeasure = beatsPerMeasure;
  }
  getTotalTicks(): number {
    return this.beatsPerMeasure * this.beat.ticks;
  }
  beatsPerMeasure: number;
  beat: Value;
}
