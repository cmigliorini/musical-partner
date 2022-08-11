import { Injectable } from '@angular/core';
import { ScaleNoteGeneratorService } from '../scale-notes/scale-note-generator.service';
import { ValueGeneratorService } from '../values/value-generator.service';
import { Music } from './music';
import { ScaleNote } from '../scale-notes/scale-note';
import { Chord } from './note';
import { MusicGeneratorSettings } from './music-generator-settings';
import { Rhythm } from '../rhythm/rhythm';

@Injectable({
  providedIn: 'root'
})
export class MusicGeneratorService {

  constructor() { }
  /**
   * generateNotes
   */
  public generateNotes(settings: MusicGeneratorSettings): Music[] {
    const valueService = new ValueGeneratorService();
    const scaleNoteService = new ScaleNoteGeneratorService(settings.scaleNoteSettings);
    let rhythm: Rhythm[] = valueService.generateRhythm(settings.valueSettings);
    let notes: ScaleNote[] = scaleNoteService.generateScaleNotes(rhythm);
    // zip Rhythms and Notes into Music
    let music: Music[] = [];
    let iChord = 0;
    rhythm.forEach(r => {
      music.push(new Music(notes.slice(iChord, iChord+r.values.length).map(sn=>new Chord([sn])), r, settings.scaleNoteSettings.scale));
      iChord+=r.values.length;
    });
    return music;
  }
}
