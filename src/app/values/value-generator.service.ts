import { Injectable, Input } from '@angular/core';
import { ValueGeneratorSettings } from './value-generator-settings';
import { Value } from './value';
import { Rhythm } from '../rhythm/rhythm';

@Injectable({
  providedIn: 'root'
})
export class ValueGeneratorService {

  constructor() { }

  generateRhythm(settings: ValueGeneratorSettings): Rhythm[] {
    // Generate rhythms
    let beatsAvailable: number = settings.nbBeats;
    let beatsAvailableInCurrentMeasure: number = settings.timeSignature.beatsPerMeasure;
    let rhythm: Rhythm[] = [];
    while (beatsAvailable > 0) {
      // console.debug('-- start with ' + beatsAvailable + ' beats total, ' + beatsAvailableInCurrentMeasure + ' beats in current  measure');
      let newRhythm: Rhythm;
      // available rhythms are those which fit in the remainder of the measure or the total length
      let avalaibleRhythms: Rhythm[] = settings.allowedRhythms.filter(r => r.span <= Math.min(beatsAvailable, beatsAvailableInCurrentMeasure) * settings.timeSignature.beat.ticks
      );
      if (avalaibleRhythms.length === 0) {
        throw new Error('sorry, no rythm available to compleate bar or measure');
      }
      // console.debug('found ' + avalaibleRhythms.length + ' possible rhythms');
      do {
        const iRhythm: number = Math.floor(Math.random() * (avalaibleRhythms.length));
        // console.debug('selected rythm index ' + iRhythm);
        newRhythm = avalaibleRhythms[iRhythm];
      } while (newRhythm.span > Math.max(beatsAvailable, beatsAvailableInCurrentMeasure) * settings.timeSignature.beat.ticks);
      // Adjust total beat counter
      beatsAvailable -= newRhythm.span / settings.timeSignature.beat.ticks;
      // Adjust measure beat counter
      beatsAvailableInCurrentMeasure -= newRhythm.span / settings.timeSignature.beat.ticks;
      if (beatsAvailableInCurrentMeasure == 0) { // yuck
        beatsAvailableInCurrentMeasure = settings.timeSignature.beatsPerMeasure;
      }
      rhythm.push(newRhythm);
    }
    return rhythm;
  }

}
