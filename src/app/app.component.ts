import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Music } from './music/music';
import { Chord } from './music/note';
import { Value } from './values/value';
import { ScaleNote } from './scale-notes/scale-note';
import { Mode } from './scale-notes/mode.enum';
import { Scale } from './music/scale';
import { MusicGeneratorService } from './music/music-generator.service';
import { MusicGeneratorSettings } from './music/music-generator-settings';
import { ScaleNoteGeneratorSettings } from './scale-notes/scale-note-generator-settings';
import { ValueGeneratorSettings } from './values/value-generator-settings';
import { TimeSignature } from './values/time-signature';
import { FormControl } from '@angular/forms';
import { Rhythm } from './rhythm/rhythm';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'ear-partner';
  notes: Music[];
  lowestNote: Music[];
  highestNote: Music[];
  musicSettings: MusicGeneratorSettings;
  intervalNames: string[] = ['', 'seconde', 'tierce', 'quarte', 'quinte', 'sixte'];
  intervals: string[];
  totalRhythms: Music[][];
  selectedRhythms: boolean[];
  // Dirty trick to  export enum to template :/
  DictationMode = DictationMode;
  dictationMode: DictationMode;
  showSolution: boolean = false;
  firstNote: Music[];
  // TODO: bind this to UX switch
  ValueGeneratorSettings = ValueGeneratorSettings;
  rhythmicMode: ValueGeneratorSettings.RhythmicMode;
  nbBeats: number;
  musicPlayBeatValue: Value;

  constructor(private musicgen: MusicGeneratorService) {

  }
  ngOnInit() {
    this.musicSettings = new MusicGeneratorSettings;
    // ScaleNote Generator settings
    this.musicSettings.scale = new Scale(new ScaleNote(0, null), Mode.Major);
    this.musicSettings.scaleNoteSettings = new ScaleNoteGeneratorSettings();
    this.musicSettings.scaleNoteSettings.lowestNote = new ScaleNote(7 * 5, null);
    this.musicSettings.scaleNoteSettings.highestNote = new ScaleNote(7 * 5 + 4, null);
    this.musicSettings.scaleNoteSettings.maxInterval = 2;
    this.musicSettings.scaleNoteSettings.nbAccidentals = 0;
    // Value Generator Settings
    this.musicSettings.valueSettings = new ValueGeneratorSettings;
    // Initialize rhythmic mode to Binary
    this.rhythmicMode = ValueGeneratorSettings.RhythmicMode.Binary;
    this.setRhythmicMode(this.rhythmicMode);

    // update display variables for ScaleNote Generator settings
    this.intervals = Array.from(Array(this.musicSettings.scaleNoteSettings.maxInterval).keys()).reverse().map(i => this.intervalNames[i + 1]);
    this.lowestNote = this.makeSingleNoteMusic(this.musicSettings.scaleNoteSettings.lowestNote);
    this.highestNote = this.makeSingleNoteMusic(this.musicSettings.scaleNoteSettings.highestNote);
  }
  setRhythmicMode(mode: number) {
    this.rhythmicMode = mode;
    const rhythms: Rhythm[] = ValueGeneratorSettings.getStandardRhythms(mode);
    this.totalRhythms = rhythms.map(r => {
      let notes: Chord[] = r.values.map(v => Chord.singleNoteChord(new ScaleNote(5, null)));
      return [new Music(notes, r, new Scale(new ScaleNote(0, null), Mode.Major))];
    });
    this.selectedRhythms = Array(rhythms.length).fill(false);
    this.selectedRhythms[0] = true;
    if (this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Ternary) {
      this.musicSettings.valueSettings.timeSignature = new TimeSignature(6, Value.EIGHTH);
      this.nbBeats = 4;
      this.musicPlayBeatValue = Value.QUARTER_DOTTED;
    }
    else if (this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Binary){
      this.musicSettings.valueSettings.timeSignature = new TimeSignature(4, Value.QUARTER);
      this.nbBeats = 12;
      this.musicPlayBeatValue = Value.QUARTER;
    }
    else {
      throw "I don't handle rhytmic mode " + mode;
    }
    this.notes = undefined;
    this.firstNote = undefined;
  }
  generateNotes(mode: string) {
    this.updateShowClues(DictationMode[mode]);
    this.showSolution = false;
    this.musicSettings.valueSettings.allowedRhythms = [];
    this.selectedRhythms.forEach((r, i) => { if (r) this.musicSettings.valueSettings.allowedRhythms.push(ValueGeneratorSettings.getRhythm(this.rhythmicMode, i)) });
    this.musicSettings.valueSettings.nbBeats = this.nbBeats * (this.rhythmicMode == 1 ? 3 : 1);
    this.notes = this.musicgen.generateNotes(this.musicSettings);
    // Extract first note. This will probably break tuples, but we're not going to display this anyway
    this.firstNote = [new Music(this.notes
      // extract only notes, ignoring rests -- this breaks tuples if any.
      .map(music => music.notes.filter((n, iNote) => !music.rhythm.values[iNote].isRest))
      .reduce((prevChord, currChord) => prevChord.concat(currChord), [])
      // Keep only first note
      .slice(0, 1), new Rhythm([Value.QUARTER]), new Scale(new ScaleNote(0, null), Mode.Major))];
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
    const beatsIncrement = this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Binary ? 4 : 2;
    const maxBeats = this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Binary ? 16 : 8;
    const minBeats = this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Binary ? 4 : 2;
    if (this.nbBeats + beatsIncrement * by < minBeats || this.nbBeats + beatsIncrement * by > maxBeats) {
      return;
    }
    this.nbBeats += beatsIncrement * by;
  }
  private makeSingleNoteMusic(scaleNote: ScaleNote): Music[] {
    return [new Music([Chord.singleNoteChord(scaleNote)], new Rhythm([Value.QUARTER]), new Scale(new ScaleNote(0, null), Mode.Major))];
  }
  scroll(el) {
    el.scrollIntoView();
  }

  updateShowClues(dictationMode: DictationMode) {
    this.dictationMode = dictationMode;
  }
  toggleShowSolution() {
    this.showSolution = !this.showSolution;
  }

}
enum DictationMode {
  Rhythmic,
  Melodic,
  Global
}