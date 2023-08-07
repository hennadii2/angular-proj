import { Component, Input } from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';

@Component({
  selector: 'show-errors',
  templateUrl: './show-errors.component.html',
  styleUrls: ['./show-errors.component.scss']
})
export class ShowErrorsComponent {

  private static readonly errorMessages = {
    'required': () => 'This field is required.',
    'email': ()=> 'This field should be email address',
    'minlength': (params) => 'The min length of field is ' + params.requiredLength,
    'maxlength': (params) => 'The max length of field is ' + params.requiredLength,
    'min': (params) => 'The min of field is ' + params.min,
    'max': (params) => 'The max of field is ' + params.max,
    'pattern': (params) => 'The required pattern is: ' + params.requiredPattern,
    'date'                  : (params)=> 'Invalid Date Type. your date format must be dd/mm/yy',
    'number'                : (params) => 'This field should be numeric.',
    'ipaddress'             : (params) => 'The ip address must be valid(x.x.x.x, where x is number that max value is 255)',
    'telephoneNumber'       : (params) => 'The phone number must be valid (XXX-XXX-XXXX, where X is a digit)',
    'noMatchPassword'       : (params) => 'Password and Confirm Password should be same.',
    'phoneNumer'            : (params) => 'This phone number is wrong. Please enter correctly.'
  };

  @Input()
  private control: AbstractControlDirective | AbstractControl;

  shouldShowErrors(): boolean {
    return this.control &&
      this.control.errors &&
      (this.control.dirty || this.control.touched);
  }

  listOfErrors(): any[] {
    let errors:Array<any> = [];
    errors = Object.keys(this.control.errors)
      .filter(field=>field != 'pattern')
      .map( 
        field => {
          let error = {};
          error['msg'] = this.getMessage(field, this.control.errors[field]);
          // error['param'] = this.control.errors[field].requiredLength ? this.control.errors[field].requiredLength : null; 
          return error;
      });
    

    return errors;
  }

  private getMessage(type: string, params: any) {
    return ShowErrorsComponent.errorMessages[type](params);
  }

}
