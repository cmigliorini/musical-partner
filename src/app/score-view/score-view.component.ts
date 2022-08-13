import { Component, OnChanges, Input, ViewChild, SimpleChanges, ElementRef, AfterViewInit } from '@angular/core';
import * as Vex from 'vexflow';
import { Music } from '../music/music';
import { Value } from '../values/value';
import { range } from 'rxjs';
import { TimeSignature } from '../values/time-signature';
import { ValueGeneratorSettings } from '../values/value-generator-settings';
import { Accidental, Barline, Beam, Formatter, Renderer, Stave, StaveNote, Tuplet, Voice } from 'vexflow';

const cmajor_scale: number[] = [1, 3, 6, 8, 10];
@Component({
  selector: 'app-score-view',
  templateUrl: './score-view.component.html',
  styleUrls: ['./score-view.component.sass']
})
export class ScoreViewComponent implements OnChanges, AfterViewInit {
  @ViewChild('stave') displayDiv: ElementRef;

  // notes are input by other modules
  @Input() notes: Music[];
  @Input() timeSignature: TimeSignature;
  @Input() isVisible: boolean;
  @Input() displayClef: boolean;
  @Input() displayTimeSignature: boolean;
  @Input() showOnlyRhythm?: boolean;
  @Input() showOnlyPitches?: boolean;
  @Input() rhythmicMode?: ValueGeneratorSettings.RhythmicMode;
  computedTimeSignature: boolean;

  // Internals : staves, beams and notes chunked by measure
  // TODO: create a structure to hold stave and notes in a single array element
  // One stave per measure
  staves: Stave[];
  // one array of notes per stave
  private voices: Voice[];
  private tupletsPerMeasure: Tuplet[][];
  
  // TODO: try to make this dynamic, based on stave content
  DEFAULT_STAVE_WIDTH: number = 300;


  private readonly note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private rendererWidth: number;
  private rendererHeight: number;

  // This will convert a single note tuplet into a string representing a single note
  private note_height(key: number): string {
    return this.note_names[key % 12].concat('/', Math.floor(key / 12 - 1).toString());
  }

  // This  will convert a `Note` duration to a vexflow duration
  private noteDuration(duration: number): string {
    // We don't do bigger than WHOLE.ticks, nor smaller than SIXTEENTH.ticks.
    if (duration > Value.WHOLE.ticks || duration < Value.SIXTYFOURTH.ticks) {
      throw new Error('invalid duration ' + duration.toString());
    }
    // First, find base note. we start from WHOLE.ticks, and go down...
    // TODO: make it a loop, remove instead of divide...
    let note: number;
    let remainder: number;
    if (duration == Value.WHOLE.ticks) {
      note = 1;
      remainder = 0;
    } else if (duration >= Value.HALF.ticks) {
      note = 2;
      remainder = duration % Value.HALF.ticks;
    } else if (duration >= Value.QUARTER.ticks) {
      note = 4;
      remainder = duration % Value.QUARTER.ticks;
    } else if (duration >= Value.EIGHTH.ticks) {
      note = 8;
      remainder = duration % Value.EIGHTH.ticks;
    } else if (duration >= Value.SIXTEENTH.ticks) {
      note = 16;
      remainder = duration % Value.SIXTEENTH.ticks;
    } else if (duration >= Value.THIRTYSECONDTH.ticks) {
      note = 32;
      remainder = duration % Value.SIXTYFOURTH.ticks;
    } else if (duration >= Value.SIXTYFOURTH.ticks) {
      note = 64;
      remainder = duration % Value.SIXTYFOURTH.ticks;
      if (remainder != 0) {
        throw new Error('I don\'t dot SIXTYFOURTHs');
      }
    } else {
      note = 1
      remainder = 0;
    }
    // Now we need to define dots. We'll divide remainder by 2 until it's either too small (we don't dot 32nd => throw) or zero.
    let divisor: number = Value.WHOLE_TICKS / note;
    let dots: number = 0;
    while (remainder != 0 && divisor >= Value.SIXTYFOURTH.ticks) {
      dots += 1;
      divisor >>= 1;
      remainder = remainder % divisor;
    }
    if (remainder != 0) {
      throw new Error('we can\'t calculate dots: duration=' + duration + ', note=' + note);
    }
    return note.toString().concat('d'.repeat(dots));
  }

  // Translate input into internal representation, then draw score
  ngOnChanges(changes: SimpleChanges): void {
    // Should construct the WHOLE.ticks shebang of staves, beams, etc. All settings are more or less interrelated, so we include a  complete recomputation if any of them change.
    if (changes["notes"] || changes["displayClef"] || changes["displayTimeSignature"] || changes["timeSignature"] || changes["showOnlyRhythm"]) {

      // Then redisplay
      let ticks: number = 0;
      this.staves = [];
      if (this.notes == null) {
        return;
      }
      let current_stave: Stave = new Stave(0, 0, this.DEFAULT_STAVE_WIDTH);
      if (this.displayClef) {
        current_stave.addClef("treble");
      }
      // We will use a computed time signature, in case it's not provided, but as the computed  value might change we need to know we have to recompute it based on musid
      if (this.timeSignature == null || this.computedTimeSignature) {
        let beatValue: Value = Value.QUARTER;
        if (this.rhythmicMode && this.rhythmicMode == ValueGeneratorSettings.RhythmicMode.Ternary) {
          beatValue = Value.EIGHTH;
        } 
        this.timeSignature = new TimeSignature(this.notes.map(n => n.rhythm.span).reduce((a, b) => a + b, 0) / beatValue.ticks, beatValue);
        this.computedTimeSignature = true;
      }
      else {
        this.computedTimeSignature = false;
      }
      if (this.displayTimeSignature) {
        current_stave.addTimeSignature(this.timeSignature.beatsPerMeasure.toString().trim() + '/' + (Value.WHOLE_TICKS / this.timeSignature.beat.ticks));
      }
      this.staves.push(current_stave);

      let notes_per_measure: StaveNote[][] = [];
      notes_per_measure.push(new Array<StaveNote>());
      let current_notes_per_measure = notes_per_measure[0];
      // Store voices for later drawing
      this.voices = [];

      // Store tuplets for later drawing
      this.tupletsPerMeasure = [];
      this.tupletsPerMeasure.push(new Array<Tuplet>());
      let currentTupletsPerMeasure = this.tupletsPerMeasure[0];

      // We'll construct an array of Note arrays, an array of Stave, and an array of Beams for later rendering
      this.notes.forEach(music => {
        // First we might need to create a stave, a new set of notes, if current one is full
        if (ticks >= this.timeSignature.getTotalTicks()) {
          // New stave
          current_stave = new Stave(0, 0, this.DEFAULT_STAVE_WIDTH);
          this.staves.push(current_stave);
          // New array of Notes
          current_notes_per_measure = new Array<StaveNote>();
          notes_per_measure.push(current_notes_per_measure);
          // New array of Tuples
          currentTupletsPerMeasure = new Array<Tuplet>();
          this.tupletsPerMeasure.push(currentTupletsPerMeasure);
          // reset ticks counter
          ticks = 0;
        }
        // First We need to find out whether current_stave will hold our rhythm, or throw
        if (music.rhythm.span > this.timeSignature.getTotalTicks() - ticks) {
          throw new Error("current rhythm will make current stave overflow:" + music.rhythm.span + ' ' + this.timeSignature.getTotalTicks() + ' ' + ticks);
        }
        // We're good, let's add the rhythm's notes to current stave
        // rythm->notes->key[] translated to strings + duration -> stavenote

        // We will flow our StaveNotes to an array that will be used later to create tuples if necessary
        let currentMusicNotes: StaveNote[] = [];
        music.rhythm.values.forEach((value, i) => {
          let duration: string = this.noteDuration(value.ticks);
          if (value.isRest) {
            duration += 'r';
          }
          // Basic note
          // Let's determine  the headstyle in the case of rhythms only
          let noteKeys: string[];
          if (this.showOnlyRhythm) {
            noteKeys = value.ticks >= Value.HALF.ticks ? ['g/4/x3'] : ['g/4/X2'];
          } else {
            noteKeys = music.notes[i].notes.map(scaleNote => this.note_height(music.scale.toPitch(scaleNote).key)
              // change note head if we hide stems
              + (this.showOnlyPitches ? '/d1' : ''));
          }
          // All rests are aligned to b/4
          if (value.isRest) {
            noteKeys = ['b/4'];
          }
          let baseNote = new StaveNote({
            keys: noteKeys,
            duration: duration
          });
          // Hide stems and flags
          if (this.showOnlyPitches) {
            baseNote.setStemStyle({ fillStyle: "none", strokeStyle: "none" });
            baseNote.setFlagStyle({ fillStyle: "none", strokeStyle: "none" });
          }

          // Add dots unless we don't show stems
          if (!this.showOnlyPitches) {
            // number of dots TODO: this is ugly
            let nbDots = duration.includes('d') ?
              1 + duration.lastIndexOf('d') - duration.indexOf('d')
              : 0;
              // FIXME: did addDotToAll() disappear since 1.2.88 ?
            // range(0, nbDots).forEach(() =>
            //   baseNote.addDotToAll()
            // );
          }
          // Do we have accidentals
          // TODO: this will have to come with more sematics injected into this component (key, etc.) so
          // we know when to add accidentals and which accidentals to use.
          // TODO: we will need to handle accidents  withi a stave so we add "natural" sign and don't repeat accidents
          if (!this.showOnlyRhythm) {
            music.notes[i].notes.forEach((scaleNote, i_) => {
              if (cmajor_scale.includes(music.scale.toPitch(scaleNote).key % 12)) {
                // FIXME: did addAccidental disappear since 1.2.88 ?
                // baseNote.addAccidental(i_, new Accidental('#'));
              }
            });
          }
          // Add note to current array, unless we showOnlyPitches and this is a rest
          if (!(this.showOnlyPitches && value.isRest)) {
            currentMusicNotes.push(baseNote);
          }

        });

        // Add notes to stave
        currentMusicNotes.forEach(n => current_notes_per_measure.push(n));

        // Handle Tuplets
        if (music.rhythm.isTuplet) {
          // Compute "factor"
          let smallest = music.rhythm.values.map(v => v.ticks).reduce((p, c) => Math.min(p, c), Value.WHOLE_TICKS);
          let nbNotes = music.rhythm.values.map(v => v.ticks).reduce((p, c) => p + c, 0) / smallest;
          let occupy = music.rhythm.span / smallest;
          
          currentTupletsPerMeasure.push(new Tuplet(currentMusicNotes, {ratioed: false, num_notes: nbNotes, notes_occupied:occupy}));
        }

        ticks += music.rhythm.span;
      });

      // fine tune stave widths
      notes_per_measure.forEach((m, i) => {
        // Precalculate min width using Formatter
        let vf = new Formatter();
        let voice = new Voice({ num_beats: this.timeSignature.beatsPerMeasure, beat_value: Value.WHOLE_TICKS / this.timeSignature.beat.ticks });
        voice.addTickables(m);
        // If we show only pitches, we will remove rests so we might have incomplete voices
        if (this.showOnlyPitches) {
          voice.setStrict(false);
        }
        this.voices.push(voice);
        const width = vf.preCalculateMinTotalWidth([voice]);
        // Adjust width to accomodate for Vex.Flow's behaviour:
        // 1- apparently it more or less adjusts the smallest value to a fixed minimal width
        const minValue: number = m.map(v => v.getTicks().value()).reduce((a, b) => Math.min(a, b), Value.WHOLE_TICKS);
        const multiplicationFactor: number = m.length > 1 ? this.multiplicationFactor(minValue) : 1;
        const extraWidth = (this.displayClef ? 30 : 0) + (this.displayTimeSignature ? 30 : 0);
        this.staves[i].setWidth(width * multiplicationFactor
          // 2- it shrinks 1-note staves to an extreme narrowness
          + (m.length > 1 ? 30 : 60)
          // 3- it does not handle clefs and time signature
          + (i == 0 ? extraWidth : 0));

        // Set start X based on previous stave
        // TODO: also allow staves to be stacked on several lines based on an externally provided Max Width
        this.staves[i].setX(i == 0 ? 0 : (this.staves[i - 1].getX() + this.staves[i - 1].getWidth()));
      });
      // Add an end bar at the latest stave and provide room for it
      if (!this.computedTimeSignature) {
        this.staves[this.staves.length - 1].setEndBarType(Barline.type.END);
        this.staves[this.staves.length - 1].setWidth(this.staves[this.staves.length - 1].getWidth() + 20);
      }

      // Now display them all!
      this.displayAll();
    }

  }
  private multiplicationFactor(smallestValueTicks: number): number {
    if (smallestValueTicks <= Value.SIXTEENTH.ticks) {
      return 1;
    } else if (smallestValueTicks <= Value.EIGHTH.ticks) {
      return 1.2;
    } else if (smallestValueTicks <= Value.QUARTER.ticks) {
      return 1.4;
    } else if (smallestValueTicks <= Value.HALF.ticks) {
      return 1.8;
    } else {
      return 2;
    }
  }
  ngAfterViewInit() {
    // We need to hook  on to this because displayAll won't work after first call to ngOnChanges()
    //TODO: this probably means that we display twice...
    this.displayAll();
  }
  // Display current data
  displayAll(): void {
    //  Get destination element and empty it first
    if (this.displayDiv == null) {
      return;
    }
    const div: HTMLDivElement = this.displayDiv.nativeElement;
    div.childNodes.forEach(child => div.removeChild(child));
    // Get our context to this element
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    const ctx = renderer.getContext();

    // Draw measures
    this.staves.forEach((stave, i) => {

      stave.setContext(ctx).draw();

      // Then create beams, if requested.
      const beams = this.showOnlyPitches ? [] : Beam.applyAndGetBeams(this.voices[i], undefined,
        Beam.getDefaultBeamGroups(this.timeSignature.beatsPerMeasure.toString().trim() + '/' + (Value.WHOLE_TICKS / this.timeSignature.beat.ticks)));

      // Instantiate a `Formatter` and format the notes.
      new Formatter()
        .joinVoices([this.voices[i]])
        .formatToStave([this.voices[i]], stave, { align_rests: false, context: ctx });

      // Render the voice and beams to the stave.
      this.voices[i].setStave(stave).draw(ctx, stave);
      beams.forEach(beam => beam.setContext(ctx).draw());

      if (!this.showOnlyPitches) {
        this.tupletsPerMeasure[i].forEach(tuplet => tuplet.setContext(ctx).draw());
      } 
    });
    // Compute total dimensions
    // TODO: find out why we need this bloody 10
    const rendererWidth = 10 + this.staves.map(s => s.getWidth()).reduce((n_1, n) => n_1 + n, 0);
    const rendererHeight = 30 + this.staves.map(s => s.getHeight()).reduce((oldMax, current) => Math.max(oldMax, current), 0);

    // Now resize renderer to fit all staves
    renderer.resize(rendererWidth, rendererHeight);
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;
  }
}
