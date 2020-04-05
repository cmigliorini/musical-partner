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
    if (true || this.addMetronome) {
      let metronomeStartTime: number = time;
      // Total number of beats
      const nbTotalTicks: number = this.notes.map(v => v.getSpan()).reduce((s, t) => s + t);
      const nbTotalBeats: number = nbTotalTicks / Value.WHOLE_TICKS * timeSignatureValue;
      console.log('nbTotalTicks {}, nbTotalBeats {}', nbTotalTicks, nbTotalBeats);
      let metronomeSynth: Tone.Synth = this.metronomeSynth;
      const beatTime: number = Tone.Time(Value.QUARTER.ticks / ticksPerSecond).quantize("64n");
      Array(nbTotalBeats).fill(1).forEach(i => {
        metronomeSynth.triggerAttackRelease('g7', '32n', metronomeStartTime);
        console.log('g7/32n @' + metronomeStartTime.toString());
        metronomeStartTime += beatTime;
      });
    }

    let startTime: number = time;
    let synth: Tone.PolySynth = this.synth;
    this.notes.forEach((music: Music) => {
      // Determine time duration of a whole note, so we can later precisely quantize values
      // schedule all chords
      music.getNotes().forEach(note => {
        // Determine current note value
        // FIXME: use "note timings", e.g. 16n
        let value: number = Tone.Time(note.value.ticks / ticksPerSecond).quantize("64n");
        // ... and pitch
        let pitches: string[] = [];
        note.chord.forEach(scaleNote => pitches.push(music.getScale().toPitch(scaleNote).getEnglishString()));
        console.log(pitches.toString() + '/' + value.toString() + ' @' + startTime.toString());
        // Schedule play
        synth.triggerAttackRelease(pitches, value, startTime);
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
