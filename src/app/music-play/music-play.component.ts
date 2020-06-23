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

    this.piano = new Piano({ maxPolyphony: 5, velocities:1 }).toDestination();
    this.piano.load().then(() => this.samplesLoaded = true);

  }

  ngOnInit(): void {
  }
  ngOnChanges(): void {
    // TODO: Convert  Rythms to (string[], value) notes so that play don't compute stuff
    if (this.notes == null) {
      return;
    }
  }

  play(time: number) {
    let bps = Tone.Transport.bpm.value / 60;
    let ticksPerSecond = this.beatValue.ticks * bps;

    console.debug('starting play at ' + time);
    // if we need to add a metronome, we'll  generate a loop
    if (this.addMetronome) {
      let metronomeStartTime: number = time + 0.5;
      // Total number of beats
      const nbTotalTicks: number = this.notes.map(v => v.rhythm.span).reduce((s, t) => s + t);
      const nbTotalBeats: number = nbTotalTicks / this.beatValue.ticks;
      // console.log('nbTotalTicks {}, nbTotalBeats {}', nbTotalTicks, nbTotalBeats);
      let metronomeSynth: Tone.Synth = this.metronomeSynth;
      
      const beatTime: number = Tone.Time(this.beatValue.ticks / ticksPerSecond).toSeconds();
      Array(nbTotalBeats).fill(1).forEach(i => {
        metronomeSynth.triggerAttackRelease('c6', '32n', metronomeStartTime);
        // console.log('c6/32n @' + metronomeStartTime.toString());
        metronomeStartTime += beatTime;
      });
    }

    let startTime: number = time + 0.5;
    let piano: Piano = this.piano;
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
          pitches.forEach(p => piano.keyDown({ note: p, time: startTime }).keyUp({ note: p, time: startTime + value }));
        }
        startTime += value;
      });
    });
    //Tone.Transport.stop(startTime + 0.1);
    //Tone.Transport.scheduleOnce(this.endOfPlay.bind(this), startTime);
  }
  // endOfPlay() {
  //   this.playing = false;
  // }
  onStart() {
    if (this.notes == null) {
      return;
    }
    if (Tone.Transport.state === "started") {
      console.log("stopping Tone");
      this.onStop();
    }
    Tone.start();

    if (Tone.Transport.state !== "stopped") {
      console.debug("aldready running");
      return;
    }
    Tone.Transport.bpm.value = this.tempo;
    //this.playing = true;
    // TODO: schedule end of play somehow, setting "playing=false"
    Tone.Transport.scheduleOnce(this.play.bind(this), 0);

    Tone.Transport.start();
  }

  onStop() {
    if (Tone.Transport.state !== "started") {
      console.debug("not started");
      return;
    }
    console.log("stopping Tone Transport");
    let position = Tone.Transport.position;
    let positionSeconds = Tone.Time(position).toSeconds();
    Tone.Transport.stop(positionSeconds);
  }
}
