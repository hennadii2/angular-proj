import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizePipe } from './capitalize.pipe';
import { PluralPipe } from './plural.pipe';
import { RoundPipe } from './round.pipe';
import { TimingPipe } from './timing.pipe';
import { NumberWithCommasPipe } from './number-with-commas.pipe';
import { SafePipe } from './safe.pipe';

const PIPES = [
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
  SafePipe
];


@NgModule({
  imports: [],
  exports: [...PIPES],
  declarations: [...PIPES],
  entryComponents: [],
})
export class PipesModule {
}
