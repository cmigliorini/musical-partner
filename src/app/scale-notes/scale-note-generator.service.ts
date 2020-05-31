import { Injectable, Input } from '@angular/core';
import { ScaleNote } from './scale-note';
import { ScaleNoteGeneratorSettings } from './scale-note-generator-settings';
import { Value } from '../values/value';
import { Rhythm } from '../rhythm/rhythm';

@Injectable({
  providedIn: 'root'
})
export class ScaleNoteGeneratorService {
  settings: ScaleNoteGeneratorSettings;

  constructor(settings: ScaleNoteGeneratorSettings) {
    this.settings = settings;
    if (typeof this.settings.nbAccidentals === 'number' && this.settings.nbAccidentals !== 0) {
      throw '';
    }
  }
  /**
   * generateScaleNotes
   */
  public generateScaleNotes(rhythm: Rhythm[]): ScaleNote[] {
    // Generate first note -- so if we have a rest, we can use this.
    let currentScaleNote: ScaleNote = this.findNextDegree(null);
    let scaleNotes: ScaleNote[] = [];
    let previousInterval: number;
    let currentInterval: number;
    rhythm.forEach(r => r.values.forEach(value => {
      let nextScaleNote: ScaleNote;
      if (value.isRest) {
        nextScaleNote = currentScaleNote;
      }
      else {
        // Unless maxInterval==0, we'll retry until we don't have more than 2 successive identical notes
        // algorithm is ugly but to date i could not find a better one.
        do {
          nextScaleNote = this.findNextDegree(currentScaleNote);
          currentInterval = currentScaleNote ? nextScaleNote.degree - currentScaleNote.degree : undefined;
        } while (this.settings.maxInterval !== 0 && (this.settings.highestNote.degree != this.settings.lowestNote.degree)
        && previousInterval === 0 && currentInterval === 0)
      }
      // Move forward
      currentScaleNote = nextScaleNote;
      previousInterval = currentInterval;
      scaleNotes.push(currentScaleNote);
    }));
    return scaleNotes;
  }
  private findNextDegree(currentScaleNote: ScaleNote): ScaleNote {
    if (currentScaleNote === null) {
      // Find out our base note, randomized between lowest and highest
      const amplitude: number = this.settings.highestNote.degree - this.settings.lowestNote.degree;
      const degree: number = this.settings.lowestNote.degree + Math.floor(Math.random() * amplitude + 0.99);
      //console.log('' + this.settings.lowestNote.degree + '<' + degree + '<' + this.settings.highestNote.degree);
      // No alteration for first note. This might change in the future, but you know...
      return new ScaleNote(degree, null);
    }
    // If maxInterval is 0 then, well, we return previous note
    if (this.settings.maxInterval == 0 || this.settings.highestNote.degree == this.settings.lowestNote.degree) {
      return currentScaleNote;
    }
    // Here, we base our calculation on previous note and distance to / from lowest and highest so we tend to go up more
    // when we're close to the lowest, and down when we get high.
    // altitude lets us know how high we are relative to global allowed range: -1 if we're at the bottom, 1 if we're at the top

    const lowerDegree: number = this.settings.lowestNote.degree;
    const higherDegree: number = this.settings.highestNote.degree;
    const midPoint: number = (higherDegree + lowerDegree) / 2.0;
    const altitude: number = 2. * (currentScaleNote.degree - midPoint) / (higherDegree - lowerDegree);
    // We'll use it to shift the probability that we go up or down. Following values are "normalized" from -1 to 1
    const lowerAcceptableInterval: number = (-1 - (altitude < 0 ? altitude : 0)) * this.settings.maxInterval - 0.49;
    const higherAcceptableInterval: number = (1 - (altitude > 0 ? altitude : 0)) * this.settings.maxInterval + 0.49;
    const acceptableIntervalRange: number = (higherAcceptableInterval - lowerAcceptableInterval);
    const interval: number = Math.round((Math.random() * acceptableIntervalRange + lowerAcceptableInterval));

    if (interval > this.settings.maxInterval || interval < -this.settings.maxInterval) {
      console.error('midPoint=' + midPoint + ', currenDegree=' + currentScaleNote.degree + ', altitude=' + altitude.toString() + ', loweracc=' + lowerAcceptableInterval
        + ', higherAcc= ' + higherAcceptableInterval + ' - range' + acceptableIntervalRange + ', interval=' + interval);
    }
    // Safety net...
    const nextDegree: number = Math.max(this.settings.lowestNote.degree, Math.min(this.settings.highestNote.degree, currentScaleNote.degree + interval));
    return new ScaleNote(nextDegree, null);
  }

}
