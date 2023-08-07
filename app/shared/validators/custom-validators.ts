import { FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { AbstractControl } from '@angular/forms/src/model';
import { Observable } from 'rxjs';
import { ValidatorFn } from '@angular/forms';
import { NullTemplateVisitor } from '@angular/compiler';


export class CustomValidators {

  static isNumeric(c: FormControl): ValidationErrors {
    const numValue = Number(c.value);
    const isValid = !isNaN(numValue);
    const message = {
      'number': {
        'message': ''
      }
    };
    return isValid ? null : message;
  }
  
  static isExistTimeSlot( c: FormControl) :ValidationErrors {
    const numValue = Number(c.value);
    const isValid = !isNaN(numValue);
    if ( isValid && numValue < 1 ){
      const message = {
        'shift_timeslot': {
          'message': ''
        }
      }
      return message;
    }

    return null;
  }

  static isLogin( form :FormGroup ):ValidationErrors {
    const message = {};
    const usernameControl = form.get('username');
    const passwordControl  = form.get('password');

    if ( passwordControl && usernameControl ){
      if ( !usernameControl.value || usernameControl.value.length < 1 ){
        message['noUserName'] = '';
        return message;
      }else if ( !passwordControl.value || passwordControl.value.length < 1){
        message['noPassword'] = '';
        return message;
      }
    }
    return null;        
  }

  static MatchPassword( form: FormGroup ):ValidationErrors{
    const passwordControl = form.get('password');
    const confirmControl  = form.get('confirm');
    const message ={};  
    if ( passwordControl && confirmControl ){
      const password = passwordControl.value;
      const confirm = confirmControl.value;

      if ( password != confirm ){

        message['noMatchPassword'] ='';        
        return message;
      }
    }
    return null;
  }

  static isCorrectRange( form :FormGroup, c1 :AbstractControl, c2 :AbstractControl, errType :string ): ValidationErrors{
    if (!c1 && !c2 ) {    
      const minValue = c1.value;
      const maxValue = c2.value;
      let error = null;
      if ( minValue > maxValue ) {
        const message = {};
        message[errType] ='';
        return message;
      }
    }
    return null;
  }

  static birthYear(c: FormControl): ValidationErrors {
    const numValue = Number(c.value);
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 85;
    const maxYear = currentYear - 18;
    const isValid = !isNaN(numValue) && numValue >= minYear && numValue <= maxYear;
    const message = {
      'years': {
        'message': 'The year must be a valid number between ' + minYear + ' and ' + maxYear
      }
    };
    return isValid ? null : message;
  }


  public validate(c: FormControl): {[key: string]: any} {
    let emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    let valid = emailRegEx.test(c.value);
    
    return c.value < 1 || valid ? null : {'isEmail': true};
  }

  static phoneNumber(c: FormControl) : ValidationErrors {
    const phone_num = c.value;
    const message = {
      'phoneNumer': {
        'message': ''
      }
    }
    return (phone_num && phone_num.indexOf('_') != -1) ? message : null;

  }

  static countryCity(form: FormGroup): ValidationErrors {
    const countryControl = form.get('country');
    const cityControl = form.get('city');

    if (countryControl != null && cityControl != null) {
      const country = countryControl.value;
      const city = cityControl.value;
      let error = null;

      if (country === 'France' && city !== 'Paris') {
        error = 'If the country is France, the city must be Paris';
      }

      const message = {
        'countryCity': {
          'message': error
        }
      };

      return error ? message : null;
    }
  }




  static uniqueName(c: FormControl): Promise<ValidationErrors> {
    const message = {
      'uniqueName': {
        'message': 'The name is not unique'
      }
    };

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(c.value === 'Existing' ? message : null);
      }, 1000);
    });
  }
  static date(c: FormControl): ValidationErrors {
    const message = {
      'date': {
        'message': ''
      }
    };

    if (!/^\d{1,2}\/\d{1,2}\/\d{2}/g.test(c.value))
      return message;
 
    // Parse the date parts to integers
    let parts = c.value.split("/");
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    // Check the ranges of month and year
    if(month == 0 || month > 12 || year > 99 || year < 0)
        return message;

    let monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if((year + 2000) % 400 == 0 || ((year + 2000) % 100 != 0 && (year + 2000) % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    if (day > 0 && day <= monthLength[month - 1]) return null;

    return message;
  }

  static ipAddress(c: FormControl): ValidationErrors {
    const isValidIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(c.value);
    const message = {
      'ipaddress': {
        'message': ''
      }
    };
    return isValidIP || !c.value || c.value.trim() == '' ? null : message;
  }

  static telephoneNumber(c: FormControl): ValidationErrors {
    const isValidPhoneNumber = /^\d{3,3}-\d{3,3}-\d{4,4}$/.test(c.value);
    const message = {
      'telephoneNumber': {
        'message': ''
      }
    };
    return isValidPhoneNumber ? null : message;
  }

  static telephoneNumbers(form: FormGroup): ValidationErrors {

    const message = {
      'telephoneNumbers': {
        'message': 'At least one telephone number must be entered'
      }
    };

    const phoneNumbers = form.controls;
    const hasPhoneNumbers = phoneNumbers && Object.keys(phoneNumbers).length > 0;

    return hasPhoneNumbers ? null : message;
  }
}
