import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Music } from '../music/music';
import { Value } from '../values/value';
import { Piano } from '@tonejs/piano'
import * as Tone from "tone";

@Component({
  selector: 'app-music-play',
  templateUrl: './music-play.component.html',
  styleUrls: ['./music-play.component.sass']
})

export class MusicPlayComponent implements OnInit, OnChanges {
  @Input() notes: Music[];
  @Input() addMetronome?: boolean;
  @Input() beatValue: Value;
  @Input() tempo: number

  private piano: Piano;
  private metronomeSynth: Tone.Synth;
  samplesLoaded: boolean;
  playing: boolean = false;

  metronomePart: Tone.Part<{ time: number; value: string; pitch: string; }>;
  musicPart: Tone.Part<{ time: number; value: number; pitch: string; }>;

  constructor() {
    // This will pretty much create a "clave" sound
    this.metronomeSynth = new Tone.Synth().toDestination();
    this.metronomeSynth.portamento = 0;
    this.metronomeSynth.envelope.attack = 0.01;
    this.metronomeSynth.envelope.attackCurve = "linear";
    this.metronomeSynth.envelope.decay = 0.05;
    this.metronomeSynth.envelope.decayCurve = "exponential";
    this.metronomeSynth.envelope.sustain = 0.002;
    this.metronomeSynth.envelope.release = 0.00;
    this.metronomeSynth.envelope.releaseCurve = "exponential";
    this.metronomeSynth.oscillator.type = "sine";

    this.piano = new Piano({ maxPolyphony: 5, velocities: 1 }).toDestination();
    this.piano.load().then(() => this.samplesLoaded = true);

  }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    if (this.notes == null) {
      return;
    }
    Tone.Transport.stop();
    Tone.Transport.bpm.value = this.tempo;

    const bps = Tone.Transport.bpm.value / 60;
    const ticksPerSecond = this.beatValue.ticks * bps;
    // if we need to add a metronome, we'll  generate a part for it
    if (this.metronomePart) {
      this.metronomePart = this.metronomePart.clear();
    }

    if (this.addMetronome) {
      let metronomeStartTime: number = 0;
      // Total number of beats
      const nbTotalTicks: number = this.notes.map(v => v.rhythm.span).reduce((s, t) => s + t);
      const nbTotalBeats: number = nbTotalTicks / this.beatValue.ticks;

      const beatTime: number = Tone.Time(this.beatValue.ticks / ticksPerSecond).toSeconds();

      let metronomeNotes: { time: number, value:string, pitch:string }[] = [];
      Array(nbTotalBeats).fill(1).forEach(_i => {
        metronomeNotes.push({ time: metronomeStartTime,  pitch: 'c6', value: '32n' });
        metronomeStartTime += beatTime;
      });

      this.metronomePart = new Tone.Part((time:number, note) => {
        this.metronomeSynth.triggerAttackRelease(note.pitch, note.value, time);
      }, metronomeNotes).start(0);
    }
    
    // Generate a Part for music
    // First, the notes
    let musicNotes: { time: number, value: number, pitch: string }[] = [];
    let startTime: number = 0;
    this.notes.forEach((music: Music) => {
      // Manage tuplets
      let tickFactor = music.rhythm.isTuplet ?
        music.rhythm.span / music.rhythm.values.map(v => v.ticks).reduce((p, c) => p + c, 0)
        : 1.0;
      // schedule all chords
      music.rhythm.values.forEach((v, i) => {
        // Determine current value
        let value: number = Tone.Time(tickFactor * v.ticks / ticksPerSecond).toSeconds();
        if (!v.isRest) {
          let pitches: string[] = [];
          music.notes[i].notes.forEach(scaleNote => pitches.push(music.scale.toPitch(scaleNote).getEnglishString()));
          // console.log(pitches.toString() + '/' + value.toString() + ' @' + startTime.toString());
          // Schedule play
          pitches.forEach(p => musicNotes.push({ time: startTime, pitch: p, value: value }));
        }
        startTime += value;
      });
    });

    // Then the Part itself
    if (this.musicPart) {
      this.musicPart = this.musicPart.clear();
    }
    this.musicPart = new Tone.Part((time:number, note) => {
      this.piano.keyDown({ note: note.pitch, time: time }).keyUp({ note: note.pitch, time: time + note.value });
    }, musicNotes).start(0);

  }

  // Called to start playing
  onStart() {
    Tone.start();
    if (this.notes == null) {
      return;
    }
    if (Tone.Transport.state === "started") {
      this.onStop();
    }

    if (Tone.Transport.state !== "stopped") {
      return;
    }

    Tone.Transport.start();
  }

  onStop() {
    Tone.Transport.stop();
  }
}
