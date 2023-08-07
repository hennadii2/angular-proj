import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div class="d-flex justify-content-end w-100">
      <span class="created-by"></span>
    </div>
  `,
})
export class FooterComponent {
}
