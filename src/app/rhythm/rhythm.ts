import { Value } from '../values/value';

/**
 * describes a rhythm.
 * @member values an array of Value
 * @member span span, can be different from the sum of values if it's a tuplet
 * @member isTuplet boolean inferred from span
 */
export class Rhythm {
    readonly values: Value[];
    readonly span: number;
    readonly isTuplet: boolean;
    constructor(values: Value[], span?: number) {
        this.values = values;
        const valuesSpan = this.span = values.map(v => v.ticks).reduce((a, b) => a + b, 0);
        this.span = span ? span : valuesSpan;
        this.isTuplet = this.span != valuesSpan;
    }

}
