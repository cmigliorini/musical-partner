import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Music } from '../music/music';
import { Value } from '../values/value';
import * as Tone from "tone";

@Component({
  selector: 'app-music-play',
  templateUrl: './music-play.component.html',
  styleUrls: ['./music-play.component.sass']
})

export class MusicPlayComponent implements OnInit, OnChanges {
  @Input() notes: Music[];
  @Input() addMetronome?: boolean;

  private synth: Tone.PolySynth;
  private metronomeSynth: Tone.Synth;

  private tempo: number = 50;

  constructor() {
    // This will pretty much create a "clave" sound
    this.metronomeSynth = new Tone.Synth().toDestination();
    this.metronomeSynth.portamento = 0;
    this.metronomeSynth.envelope.attack = 0.01;
    this.metronomeSynth.envelope.attackCurve = "linear";
    this.metronomeSynth.envelope.decay = 0.1;
    this.metronomeSynth.envelope.decayCurve = "exponential";
    this.metronomeSynth.envelope.sustain = 0.1;
    this.metronomeSynth.envelope.release = 0.01;
    this.metronomeSynth.envelope.releaseCurve = "exponential";
    this.metronomeSynth.oscillator.type = "sine";
  }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    // Convert  Rythms to Synth notes.
    if (this.notes == null) {
      return;
    }
  }

  play(time: number) {
    // TODO: @Input() this
    let timeSignatureValue = 4;// quarter note per beat
    let bps = Tone.Transport.bpm.value / 60;
    let ticksPerSecond = Value.WHOLE_TICKS / timeSignatureValue * bps;

    console.debug('starting play at ' + time);
    // if we need to add a metronome, we'll  generate a loop
    if (this.addMetronome) {
      let metronomeStartTime: number = time;
      // Total number of beats
      const nbTotalTicks: number = this.notes.map(v => v.rhythm.span).reduce((s, t) => s + t);
      const nbTotalBeats: number = nbTotalTicks / Value.WHOLE_TICKS * timeSignatureValue;
      // console.log('nbTotalTicks {}, nbTotalBeats {}', nbTotalTicks, nbTotalBeats);
      let metronomeSynth: Tone.Synth = this.metronomeSynth;
      
      const beatTime: number = Tone.Time(Value.QUARTER.ticks / ticksPerSecond).quantize("64n");
      Array(nbTotalBeats).fill(1).forEach(i => {
        metronomeSynth.triggerAttackRelease('c6', '32n', metronomeStartTime);
        // console.log('c6/32n @' + metronomeStartTime.toString());
        metronomeStartTime += beatTime;
      });
    }

    let startTime: number = time;
    let synth: Tone.PolySynth = this.synth;
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
          synth.triggerAttackRelease(pitches, value, startTime);
        }
        startTime += value;
      });
    });
    Tone.Transport.stop(startTime);

  }
  onStart() {
    if (this.notes == null) {
      return;
    }
    if (this.synth == null) {
      this.synth = new Tone.PolySynth({ maxPolyphony: 5, voice: Tone.Synth }).toDestination();
    }
    if (this.metronomeSynth == null) {
      this.metronomeSynth = new Tone.Synth().toDestination();
    }

    if (Tone.Transport.state !== "stopped") {
      console.debug("aldready running");
      return;
    }
    Tone.Transport.bpm.value = this.tempo;
    Tone.Transport.stop();
    Tone.Transport.scheduleOnce(this.play.bind(this), 0);

    Tone.Transport.start();
  };

  onStop() {
    if (Tone.Transport.state !== "started") {
      console.debug("not started");
      return;
    }
    let position = Tone.Transport.position;
    let positionSeconds = Tone.Time(position).toSeconds();
    Tone.Transport.stop(positionSeconds + 1);
  };
}
