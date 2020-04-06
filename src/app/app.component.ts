import { Component, OnInit, ElementRef } from '@angular/core';
import { Music } from './music/music';
import { Note } from './music/note';
import { Pitch } from './models/pitch';
import { Value } from './values/value';
import { Clef } from './scale-notes/clef.enum';
import { ScaleNote } from './scale-notes/scale-note';
import { Mode } from './scale-notes/mode.enum';
import { Scale } from './music/scale';
import { MusicGeneratorService } from './music/music-generator.service';
import { MusicGeneratorSettings } from './music/music-generator-settings';
import { ScaleNoteGeneratorSettings } from './scale-notes/scale-note-generator-settings';
import { ValueGeneratorSettings } from './values/value-generator-settings';
import { TimeSignature } from './values/time-signature';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'musical-dictator';
  notes: Music[];
  lowestNote: Music[];
  highestNote: Music[];
  musicSettings: MusicGeneratorSettings;
  intervalNames: string[] = ['', 'seconde', 'tierce', 'quarte', 'quinte', 'sixte'];
  intervals: string[];
  totalRhythms: Music[][];
  selectedRhyhtms: boolean[];
  // Dirty trick to  export enum to template :/
  DictationMode = DictationMode;
  dictationMode: DictationMode;

  constructor(private musicgen: MusicGeneratorService) {
    this.musicSettings = new MusicGeneratorSettings;
    // ScaleNote Generator settings
    this.musicSettings.scale = new Scale(new ScaleNote(0, null), Mode.Major);
    this.musicSettings.scaleNoteSettings = new ScaleNoteGeneratorSettings();
    this.musicSettings.scaleNoteSettings.lowestNote = new ScaleNote(7 * 5, null);
    this.lowestNote = this.makeSingleNoteMusic(this.musicSettings.scaleNoteSettings.lowestNote);
    this.musicSettings.scaleNoteSettings.highestNote = new ScaleNote(7 * 5 + 4, null);
    this.highestNote = this.makeSingleNoteMusic(this.musicSettings.scaleNoteSettings.highestNote);
    this.musicSettings.scaleNoteSettings.maxInterval = 2;
    this.intervals = Array.from(Array(this.musicSettings.scaleNoteSettings.maxInterval).keys()).reverse().map(i => this.intervalNames[i + 1]);
    this.musicSettings.scaleNoteSettings.nbAccidentals = 0;
    // Value Generator Settings
    this.musicSettings.valueSettings = new ValueGeneratorSettings();
    //this.musicSettings.valueSettings.allowedRhythms = [ValueGeneratorSettings.StandardRhythm.Quarter, ValueGeneratorSettings.StandardRhythm.QuarterDottedEight];
    const rhythms: Value[][] = ValueGeneratorSettings.getStandardRhythmValues().map(r => ValueGeneratorSettings.getStandardRhythm(r)).map(x => ValueGeneratorSettings.getRhythm(x));
    this.selectedRhyhtms = Array(rhythms.length).fill(false);
    this.selectedRhyhtms[ValueGeneratorSettings.StandardRhythm.Quarter] = true;
    this.selectedRhyhtms[ValueGeneratorSettings.StandardRhythm.Half] = true;
    this.totalRhythms = rhythms.map(r => {
      let notes: Note[] = r.map(v => Note.singleNote(new ScaleNote(5, null), v));
      return [new Music(notes, new Scale(new ScaleNote(0, null), Mode.Major))];
    })

    //this.musicSettings.valueSettings.allowedRhythms = [ValueGeneratorSettings.StandardRhythm.Quarter];
    this.musicSettings.valueSettings.nbBeats = 12;
    this.musicSettings.valueSettings.timeSignature = new TimeSignature(4, Value.QUARTER);
  }
  ngOnInit() {
  }
  generateNotes(mode: string) {
    this.updateShowClues(DictationMode[mode]);
    this.musicSettings.valueSettings.allowedRhythms = [];
    this.selectedRhyhtms.forEach((r, i) => { if (r) this.musicSettings.valueSettings.allowedRhythms.push(i) });
    this.notes = this.musicgen.generateNotes(this.musicSettings);
  }
  adjustLowestNote(by: number) {
    if (this.musicSettings.scaleNoteSettings.lowestNote.degree + by > this.musicSettings.scaleNoteSettings.highestNote.degree) {
      return;
    }
    this.musicSettings.scaleNoteSettings.lowestNote.degree += by;
    this.lowestNote = this.makeSingleNoteMusic(this.musicSettings.scaleNoteSettings.lowestNote);
  }
  adjustHighestNote(by: number) {
    if (this.musicSettings.scaleNoteSettings.highestNote.degree + by < this.musicSettings.scaleNoteSettings.lowestNote.degree) {
      return;
    }
    this.musicSettings.scaleNoteSettings.highestNote.degree += by;
    this.highestNote = this.makeSingleNoteMusic(this.musicSettings.scaleNoteSettings.highestNote);
  }
  adjustMaxInterval(by: number) {
    if (this.musicSettings.scaleNoteSettings.maxInterval + by < 1 || this.musicSettings.scaleNoteSettings.maxInterval + by > 5) {
      return;
    }
    this.musicSettings.scaleNoteSettings.maxInterval += by;
    this.intervals = Array.from(Array(this.musicSettings.scaleNoteSettings.maxInterval).keys()).reverse().map(i => this.intervalNames[i + 1]);
  }
  adjustNbBeats(by: number) {
    if (this.musicSettings.valueSettings.nbBeats + 4 * by <= 0 || this.musicSettings.valueSettings.nbBeats + 4 * by > 16) {
      return;
    }
    this.musicSettings.valueSettings.nbBeats += 4 * by;
  }
  private makeSingleNoteMusic(scaleNote: ScaleNote): Music[] {
    return [Music.oneNoteRhythm(Note.singleNote(scaleNote, Value.QUARTER), new Scale(new ScaleNote(0, null), Mode.Major))];
  }
  scroll(el) {
    el.scrollIntoView();
  }

  updateShowClues(dictationMode: DictationMode) {
    this.dictationMode = dictationMode;
  }
}
enum DictationMode {
  Rhythmic,
  Melodic,
  Global
}