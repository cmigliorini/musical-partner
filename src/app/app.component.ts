import { Component, OnInit } from '@angular/core';
import { Music } from './music/music';
import { Chord } from './music/note';
import { Value } from './values/value';
import { ScaleNote } from './scale-notes/scale-note';
import { Scale } from './music/scale';
import { MusicGeneratorService } from './music/music-generator.service';
import { MusicGeneratorSettings } from './music/music-generator-settings';
import { ScaleNoteGeneratorSettings } from './scale-notes/scale-note-generator-settings';
import { ValueGeneratorSettings } from './values/value-generator-settings';
import { TimeSignature } from './values/time-signature';
import { Rhythm } from './rhythm/rhythm';
import { FormControl, FormGroup } from '@angular/forms';
import { Mode } from './scale-notes/mode.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  eScaleMode: typeof Mode = Mode;
  modeForm = new FormGroup({
    mode: new FormControl(Mode.Major)
  });
  title = 'ear-partner';
  notes: Music[];
  lowestScaleNote: ScaleNote = new ScaleNote(7 * 5, null);
  lowestNote: Music[] = this.makeSingleNoteMusic(this.lowestScaleNote);
  highestScaleNote: ScaleNote = new ScaleNote(7 * 5 + 4, null);
  highestNote: Music[] = this.makeSingleNoteMusic(this.highestScaleNote);
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
  // Playback options
  bpm: number;
  readonly minBpm: number = 30;
  readonly maxBpm: number = 60;
  readonly cMajorScale: Scale = new Scale(new ScaleNote(0, null), Mode.Major);
  readonly a0 = new ScaleNote(5, null);
  readonly aMinorScale: Scale = new Scale(this.a0, Mode.Minor);
  constructor(private musicgen: MusicGeneratorService) {

  }

  ngOnInit() {
    this.musicSettings = new MusicGeneratorSettings;
    // ScaleNote Generator settings
    this.musicSettings.scaleNoteSettings = new ScaleNoteGeneratorSettings();
    this.musicSettings.scaleNoteSettings.scale = this.cMajorScale;
    this.musicSettings.scaleNoteSettings.lowestPitch = this.cMajorScale.toPitch(this.lowestScaleNote);
    this.musicSettings.scaleNoteSettings.highestPitch = this.cMajorScale.toPitch(this.highestScaleNote);
    this.musicSettings.scaleNoteSettings.maxInterval = 2;
    this.musicSettings.scaleNoteSettings.nbAccidentals = 0;
    // Value Generator Settings
    this.musicSettings.valueSettings = new ValueGeneratorSettings;
    // Initialize rhythmic mode to Binary
    this.setRhythmicMode(ValueGeneratorSettings.RhythmicMode.Binary);

    // update display variables for ScaleNote Generator settings
    this.intervals = Array.from(Array(this.musicSettings.scaleNoteSettings.maxInterval).keys()).reverse().map(i => this.intervalNames[i + 1]);
    this.lowestNote = this.makeSingleNoteMusic(this.cMajorScale.fromPitch(this.musicSettings.scaleNoteSettings.lowestPitch));
    this.highestNote = this.makeSingleNoteMusic(this.cMajorScale.fromPitch(this.musicSettings.scaleNoteSettings.highestPitch));

    // Playback
    this.bpm = 50;
  }

  ngAfterViewInit(): void {
    this.modeForm.get('mode').valueChanges.subscribe((_)=>this.updateMode());
  }
  setRhythmicMode(mode: number) {
    if (this.rhythmicMode == mode) {
      return;
    }
    this.rhythmicMode = mode;
    const rhythms: Rhythm[] = ValueGeneratorSettings.getStandardRhythms(mode);
    this.totalRhythms = rhythms.map(r => {
      let notes: Chord[] = r.values.map(v => Chord.singleNoteChord(this.a0));
      return [new Music(notes, r, this.cMajorScale)];
    });
    this.selectedRhythms = Array(rhythms.length).fill(false);
    this.selectedRhythms[0] = true;
    if (this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Ternary) {
      this.musicSettings.valueSettings.timeSignature = new TimeSignature(6, Value.EIGHTH);
      this.nbBeats = 4;
      this.musicPlayBeatValue = Value.QUARTER_DOTTED;
      this.bpm = 40;
    }
    else if (this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Binary){
      this.musicSettings.valueSettings.timeSignature = new TimeSignature(4, Value.QUARTER);
      this.nbBeats = 12;
      this.musicPlayBeatValue = Value.QUARTER;
      this.bpm = 50;
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
      .slice(0, 1), new Rhythm([Value.QUARTER]), this.cMajorScale)];
  }
  updateMode() {
    switch (this.modeForm.get('mode').value) {
      case Mode.Major:
        this.musicSettings.scaleNoteSettings.scale = this.cMajorScale;
        break;
      case Mode.Minor:
        this.musicSettings.scaleNoteSettings.scale = this.aMinorScale;
        break;
    }
  }
  adjustLowestNote(by: number) {
    if (this.lowestScaleNote.degree + by > this.highestScaleNote.degree) {
      return;
    }
    this.lowestScaleNote.degree += by;
    this.musicSettings.scaleNoteSettings.lowestPitch = this.cMajorScale.toPitch(this.lowestScaleNote);
    this.lowestNote = this.makeSingleNoteMusic(this.lowestScaleNote);
  }
  adjustHighestNote(by: number) {
    if (this.highestScaleNote.degree + by < this.lowestScaleNote.degree) {
      return;
    }
    this.highestScaleNote.degree += by;
    this.musicSettings.scaleNoteSettings.highestPitch = this.cMajorScale.toPitch(this.highestScaleNote);
    this.highestNote = this.makeSingleNoteMusic(this.highestScaleNote);
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
    return [new Music([Chord.singleNoteChord(scaleNote)], new Rhythm([Value.QUARTER]), this.cMajorScale)];
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
  adjustTempo(by:number){
    if (this.bpm + 2 * by < this.minBpm || this.bpm + 2 * by > this.maxBpm) {
      return;
    }
    this.bpm += 2 * by;
  }

}
enum DictationMode {
  Rhythmic,
  Melodic,
  Global
}