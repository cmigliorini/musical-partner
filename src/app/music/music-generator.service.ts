import { Injectable, Input } from '@angular/core';
import { ScaleNoteGeneratorService } from '../scale-notes/scale-note-generator.service';
import { ValueGeneratorService } from '../values/value-generator.service';
import { Key } from '../key.enum';
import { Scale } from './scale';
import { Music } from './music';
import { Value } from '../values/value';
import { ScaleNote } from '../scale-notes/scale-note';
import { Note } from './note';
import { MusicGeneratorSettings } from './music-generator-settings';
import { ScaleNoteGeneratorSettings } from '../scale-notes/scale-note-generator-settings';

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
    let rhythm: Value[] = valueService.generateRhythm(settings.valueSettings);
    let notes: ScaleNote[] = scaleNoteService.generateScaleNotes(rhythm);
    // zip Values and Pitches into Rhythms
    let music: Music[] = [];
    rhythm.forEach((r, i) =>
      music.push(new Music([new Note([notes[i]], r)], settings.scale))
    );
    return music;
  }
}
