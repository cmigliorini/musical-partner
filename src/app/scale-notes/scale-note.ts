import { Alteration } from './alteration.enum';

/**
 * Represents a note in a scale, by its degree.
 * @member degree: 0+octave*8 for fundamental, 7+octave*8 for sensible. Octave can be deduced from degree by integer division by 8
 * @member alteration: Flat or Sharp, relative to scale (in F major, 4th degree with Flat alteration will be Bbb, with Sharp it will be B natural)
 */
export class ScaleNote {
  degree: number;
  alteration: Alteration;
  constructor(degree: number, alteration: Alteration) {
    this.degree = degree;
    this.alteration = alteration;
  }
}
