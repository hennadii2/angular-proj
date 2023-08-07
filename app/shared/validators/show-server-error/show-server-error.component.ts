import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';

@Component({
  selector: 'show-server-error',
  templateUrl: './show-server-error.component.html',
  styleUrls: ['./show-server-error.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class ShowServerErrorComponent {

  @Input() error;

  shouldShowErrors(): boolean {
    return this.error && !this.error.valid;
  }

}
