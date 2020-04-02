import { Injectable, Input } from '@angular/core';
import { ValueGeneratorSettings } from './value-generator-settings';
import { Value } from './value';

@Injectable({
  providedIn: 'root'
})
export class ValueGeneratorService {

  constructor() { }

  generateRhythm(settings: ValueGeneratorSettings): Value[] {
    // Generate rhythms
    let beatsAvailable: number = settings.nbBeats;
    let beatsAvailableInCurrentMeasure: number = settings.timeSignature.beatsPerMeasure;
    let rhythm: Value[] = [];
    while (beatsAvailable > 0) {
      console.debug('-- start with ' + beatsAvailable + ' beats total, ' + beatsAvailableInCurrentMeasure + ' beats in current  measure');
      let newRhythm: Value[];
      // available rhythms are those which fit in the remainder of the measure or the total length
      let avalaibleRhythms: ValueGeneratorSettings.StandardRhythm[] = settings.allowedRhythms.filter(i =>
        this.getTotaTicks(ValueGeneratorSettings.getRhythm(i)) <= Math.min(beatsAvailable, beatsAvailableInCurrentMeasure) * settings.timeSignature.beat.ticks
      );
      if (avalaibleRhythms.length === 0) {
        throw new Error('sorry, no rythm available to compleate bar or measure');
      }
      console.debug('found ' + avalaibleRhythms.length + ' possible rhythms');
      do {
        const iRhythm: number = Math.floor(Math.random() * (avalaibleRhythms.length));
        console.debug('selected rythm index ' + iRhythm);
        newRhythm = ValueGeneratorSettings.getRhythm(avalaibleRhythms[iRhythm]);
      } while (this.getTotaTicks(newRhythm) > Math.max(beatsAvailable, beatsAvailableInCurrentMeasure) * settings.timeSignature.beat.ticks);
      // Adjust total beat counter
      beatsAvailable -= this.getTotaTicks(newRhythm) / settings.timeSignature.beat.ticks;
      // Adjust measure beat counter
      beatsAvailableInCurrentMeasure -= this.getTotaTicks(newRhythm) / settings.timeSignature.beat.ticks;
      if (beatsAvailableInCurrentMeasure == 0) { // yuck
        beatsAvailableInCurrentMeasure = settings.timeSignature.beatsPerMeasure;
      }
      rhythm = rhythm.concat(newRhythm);
    }
    return rhythm;
  }

  private getTotaTicks(rhythm: Value[]) {
    return rhythm.map(v => v.ticks).reduce((i, j) => i + j, 0);
  }

}
