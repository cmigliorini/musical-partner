import { Component, OnInit, Input } from '@angular/core';
import { Music } from '../music/music';
import { TimeSignature } from '../values/time-signature';

@Component({
  selector: 'app-score-display',
  templateUrl: './score-display.component.html',
  styleUrls: ['./score-display.component.sass']
})
export class ScoreDisplayComponent implements OnInit {
  // notes are input by other modules
  @Input() notes: Music[];
  @Input() timeSignature: TimeSignature;
  @Input() displayClef: boolean;
  @Input() displayTimeSignature: boolean;
  @Input() showOnlyRhythm?: boolean;

  showScore: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }
  toggleShowScore() {
    this.showScore = !this.showScore;
  }
  ngOnChanges() {
    this.showScore = false;
  }
}
