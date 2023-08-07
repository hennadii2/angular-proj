import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  public appLicence: string = "";
  public isLicenceActivated: boolean = false;
  public logoUrl: string = "";
  public siteUrl: string = "";
  public apiUrl: string = "";

  isString (value) {
    return typeof value === 'string' || value instanceof String;
  }

  isNumber (value) {
    return typeof value === 'number' && isFinite(value);
  }
  
  isArray (value) {
    return value && typeof value === 'object' && value.constructor === Array;
  }

  isObject (value) {
    return value && typeof value === 'object' && value.constructor === Object;
  }

  isFunction (value) {
    return typeof value === 'function';
  }

  isNull (value) {
    return value === null;
  }

  isBoolean (value) {
    return typeof value === 'boolean';
  }
    
  isRegExp (value) {
    return value && typeof value === 'object' && value.constructor === RegExp;
  } 

  isError (value) {
    return value instanceof Error && typeof value.message !== 'undefined';
  }

  isDate (value) {
    return value instanceof Date;
  }

  isSymbol (value) {
    return typeof value === 'symbol';
  }
}