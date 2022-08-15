import { Injectable } from '@angular/core';
import { ScaleNote } from './scale-note';
import { ScaleNoteGeneratorSettings } from './scale-note-generator-settings';
import { Rhythm } from '../rhythm/rhythm';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ScaleNoteGeneratorService {
  readonly settings: ScaleNoteGeneratorSettings;
  // settings' lowestPitch and highestPitch converted in degrees of settings' scale
  // To be used for intervals computation (not for absolute height -- use Pitches in that case)
  readonly lowestDegree: number;
  readonly highestDegree: number;

  constructor(settings: ScaleNoteGeneratorSettings) {
    this.settings = _.cloneDeep(settings);
    if (typeof this.settings.nbAccidentals === 'number' && this.settings.nbAccidentals !== 0) {
      throw '';
    };
    // Interpret lowest and higest note in C Major scale
    if (this.settings && this.settings.scale && this.settings.highestPitch && this.settings.lowestPitch) {
      this.highestDegree = this.settings.scale.fromPitch(this.settings.highestPitch).degree;
      this.lowestDegree = this.settings.scale.fromPitch(this.settings.lowestPitch).degree;
    }

  }
  /**
   * Generate scale notes for a given set of `Rhythm`
   * @param rhythm array of `Rhythms`
   * @returns array of ScaleNote, one for each value in `rhythm`
   */
  public generateScaleNotes(rhythm: Rhythm[]): ScaleNote[] {
    // Generate audible notes if any
    const audibleScaleNotes: ScaleNote[] = this.getAudibleNotes(rhythm);
    // Fill rests with nulls
    let scaleNotes: ScaleNote[] = [];
    rhythm.slice().forEach(r => r.values.slice().map(v => {
      scaleNotes.unshift(v.isRest ? null : audibleScaleNotes.pop());
    }));
    // extends null-regions to the left. Generate a non null default value in case we end
    // on a rest -- which also provides for all rest rhythms
    let currentScaleNote: ScaleNote = audibleScaleNotes.length > 0 ? audibleScaleNotes.slice(-1).pop() : this.findNextDegree(null);
    for (let index = scaleNotes.length - 1; index >= 0; index--) {
      if (scaleNotes[index] === null) {
        scaleNotes[index] = currentScaleNote;
      }
      currentScaleNote = scaleNotes[index];
    }
    return scaleNotes;
  }
  /**
   * Generate scale notes for non rest values
   * @param rhythm array of `Rhythms`
   * @returns array of ScaleNote, one for each audible (i.e. not rest) value in `rhythm`
   */
  private getAudibleNotes(rhythm: Rhythm[]): ScaleNote[] {
    // Create all audible notes
    const nbAudibleNotes = rhythm.slice().map(r => r.values.slice().filter(v => !v.isRest).length).reduce((l1, l2) => l1 + l2, 0);
    // In order to give some musicality to the music, we're going to generate
    // - final note to be a tonic if possible
    // - penultimate one to be a dominant (or at least a leading tone, depending on settings)
    const finalTonic = nbAudibleNotes > 0 ? this.findTonicIfPossible() : null;
    const penultimateNote = nbAudibleNotes > 1 ? this.getDominantOrLeadingTone(finalTonic) : null;
    let audibleScaleNotes: ScaleNote[] = [penultimateNote, finalTonic].filter(v => v !== null);
    let currentScaleNote: ScaleNote = penultimateNote || finalTonic;
    
    // Now generate evething else
    let previousInterval: number = undefined;
    let currentInterval: number = undefined;
    for (let _i of Array(nbAudibleNotes - audibleScaleNotes.length)) {
      let nextScaleNote: ScaleNote = null;
      // We don't change degree as long as we're on a rest, so we respect maxInterval across rests
      // Unless we don't have a choice, we'll retry until we don't have more than 2 successive identical notes
      // algorithm is ugly but to date i could not find a better one.
      const allowRepeatedNotes = this.lowestDegree === this.highestDegree || this.settings.maxInterval === 0;
      do {
        nextScaleNote = this.findNextDegree(currentScaleNote);
        currentInterval = currentScaleNote ? nextScaleNote.degree - currentScaleNote.degree : undefined;
      } while (!allowRepeatedNotes && previousInterval === 0 && currentInterval === 0);
      // Move backward
      currentScaleNote = nextScaleNote;
      previousInterval = currentInterval;
      audibleScaleNotes.unshift(currentScaleNote);
    }
    return audibleScaleNotes;
  }

  /**
   * If provided with a tonic, will return a dominant, or a leading tone, according to current settings
   * @returns a leading tone, a dominant, or `null` if none can be found
   */
  private getDominantOrLeadingTone(tonic: ScaleNote): ScaleNote {
    // Constraints:
    // - maxInterval (must be >1 to get a leading tone, >3 to get a dominant)
    // - lowestDegree, highestDegree: found degree must fit
    if (this.settings.maxInterval < 1 || tonic === null) {
      return null;
    }
    let degree: number;
    // Simple cadence
    if (this.settings.maxInterval >= 3 && tonic.degree - 3 >= this.lowestDegree) {
      return new ScaleNote(tonic.degree - 3, null);
    }
    // "inverted" cadence
    if (this.settings.maxInterval >= 4 && tonic.degree + 4 <= this.highestDegree) {
      return new ScaleNote(tonic.degree + 4, null);
    }
    // leading tone
    if (this.settings.maxInterval >= 1 && tonic.degree - 1 >= this.lowestDegree) {
      return new ScaleNote(tonic.degree - 1, null);
    }
    // upper leading tone
    if (this.settings.maxInterval >= 1 && tonic.degree + 1 <= this.highestDegree) {
      return new ScaleNote(tonic.degree + 1, null);
    }
    return null;
  }
  /**
   * Try to get a tonic in the allowed range, if not return null
   */
  private findTonicIfPossible(): ScaleNote {
    const octaveH = Math.floor(this.highestDegree / 7);
    const octaveL = Math.floor(this.lowestDegree / 7);
    if (octaveH > octaveL || this.lowestDegree % 7 == 0) {
      return new ScaleNote(7 * octaveH, null);
    }
    return null;
  }
  /**
   * Pick a random note, between lowest and highest
   */
  private findRandomFirstDegree(): ScaleNote {
    const amplitude: number = this.highestDegree - this.lowestDegree;
    const degree: number = this.lowestDegree + Math.floor(Math.random() * amplitude + 0.99);
    // No alteration for first note. This might change in the future, but you know...
    return new ScaleNote(degree, null);
  }
  private findNextDegree(currentScaleNote: ScaleNote): ScaleNote {
    // if no previous note, try to get a tonic, so as to get a musical ending
    if (currentScaleNote === null) {
      currentScaleNote = currentScaleNote || this.findTonicIfPossible();
      // otherwise pick a random one
      currentScaleNote = currentScaleNote || this.findRandomFirstDegree();
      return currentScaleNote;
    }

    // If maxInterval is 0 then, well, we return previous note
    if (this.settings.maxInterval == 0 || this.settings.highestPitch === this.settings.lowestPitch) {
      return currentScaleNote;
    }
    // Here, we base our calculation on previous note and distance to / from lowest and highest so we tend to go up more
    // when we're close to the lowest, and down when we get high.
    // altitude lets us know how high we are relative to global allowed range: -1 if we're at the bottom, 1 if we're at the top

    const midPoint: number = (this.highestDegree + this.lowestDegree) / 2.0;
    const altitude: number = 2. * (currentScaleNote.degree - midPoint) / (this.highestDegree - this.lowestDegree);
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
    const nextDegree: number = Math.max(this.lowestDegree, Math.min(this.highestDegree, currentScaleNote.degree + interval));
    return new ScaleNote(nextDegree, null);
  }

}
