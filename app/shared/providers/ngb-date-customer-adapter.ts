import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { NgbDateAdapter, NgbDateStruct } from '../ng-bootstrap';

@Injectable()
export class NgbDateCustomAdapter extends NgbDateAdapter<string> {
    readonly DT_FORMAT = 'DD/MM/YY';

    public fromModel(dateStr: string | null): NgbDateStruct | null {
        if (!this.isValidDate(dateStr)) return null;

        let date = moment(dateStr,this.DT_FORMAT);
        return { year: date.year(), month: date.month() + 1, day: date.date() };
    }

    public toModel(date: NgbDateStruct | null): string | null {
        return date !== null && date.year !== null && date.month !== null && date.day !== null
            ? `${date.day}/${date.month}/${date.year % 100}`
            : null;
    }

    isValidDate(str) {
        var d = moment(str,this.DT_FORMAT);
        if(d == null || !d.isValid()) return false;
      
        return str.indexOf(d.format('D/M/YY')) >= 0 
            || str.indexOf(d.format('DD/M/YY')) >= 0
            || str.indexOf(d.format('D/MM/YY')) >= 0 
            || str.indexOf(d.format('DD/MM/YY')) >= 0;
    }
}